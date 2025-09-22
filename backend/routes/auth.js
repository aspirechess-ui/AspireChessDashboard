import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import Batch from "../models/Batch.js";
import SignupCodeLog from "../models/SignupCodeLog.js";
import SignupCodeStatus from "../models/SignupCodeStatus.js";
import VerificationCode from "../models/VerificationCode.js";
import { sendEmail } from "../utils/email.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register student with signup code
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("firstName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required"),
    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required"),
    body("phoneNumber")
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .isLength({ min: 10, max: 15 })
      .withMessage("Please provide a valid phone number"),
    body("signupCode")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Signup code is required"),
    body("dateOfBirth")
      .isISO8601()
      .withMessage("Please provide a valid date of birth"),
    body("parentName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Parent name is required"),
    body("parentPhoneNumber")
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .isLength({ min: 10, max: 15 })
      .withMessage("Please provide a valid parent phone number"),
  ],
  async (req, res) => {
    try {
      console.log("Registration request received:", req.body);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        signupCode,
        dateOfBirth,
        parentName,
        parentPhoneNumber,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Validate signup code and get batch
      console.log(
        "Looking for batch with signup code:",
        signupCode.toUpperCase()
      );
      const batch = await Batch.findOne({
        signupCode: signupCode.toUpperCase(),
        deletionStatus: "active",
        isActive: true,
      });

      if (!batch) {
        console.log(
          "No batch found with signup code:",
          signupCode.toUpperCase()
        );

        // Log failed attempt
        try {
          await SignupCodeLog.logUsage(
            signupCode.toUpperCase(),
            null, // No batch found
            null, // No user created yet
            email,
            `${firstName} ${lastName}`,
            req.ip || req.connection.remoteAddress,
            req.get("User-Agent"),
            "failed",
            "Invalid or expired signup code"
          );
        } catch (logError) {
          console.error("Error logging failed signup attempt:", logError);
        }

        return res.status(400).json({
          success: false,
          message: "Invalid or expired signup code",
        });
      }

      // Check if signup code is active
      const signupCodeStatus = await SignupCodeStatus.findOne({
        batchId: batch._id,
      });

      if (signupCodeStatus) {
        const canUseResult = signupCodeStatus.canBeUsed();
        if (!canUseResult.canUse) {
          console.log("Signup code cannot be used:", canUseResult.reason);

          // Log failed attempt
          try {
            await SignupCodeLog.logUsage(
              signupCode.toUpperCase(),
              batch._id,
              null, // No user created yet
              email,
              `${firstName} ${lastName}`,
              req.ip || req.connection.remoteAddress,
              req.get("User-Agent"),
              "failed",
              canUseResult.reason
            );
          } catch (logError) {
            console.error("Error logging failed signup attempt:", logError);
          }

          return res.status(400).json({
            success: false,
            message: canUseResult.reason,
          });
        }
      }

      console.log("Found batch:", batch.batchName, "ID:", batch._id);

      // Check if batch can accept more students
      if (!batch.canAcceptStudents()) {
        console.log("Batch cannot accept more students");
        return res.status(400).json({
          success: false,
          message: "Batch is full or not accepting new students",
        });
      }

      console.log("Creating user account...");
      // Create user account
      const user = new User({
        email,
        password,
        role: "student",
        accountCreationType: "signup_code",
        signupCodeUsed: signupCode.toUpperCase(),
        assignedBatch: batch._id,
      });

      await user.save();
      console.log("User created with ID:", user._id);

      // Create user details profile
      console.log("Creating user details...");
      const userDetails = new UserDetails({
        userId: user._id,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        parentName,
        parentPhoneNumber,
        userRole: "student",
      });

      await userDetails.save();
      console.log("User details created");

      // Add student to batch
      console.log("Adding student to batch...");
      batch.addStudent(user._id);
      await batch.save();
      console.log("Student added to batch");

      // Log the signup code usage
      console.log("Logging signup code usage...");
      try {
        await SignupCodeLog.logUsage(
          signupCode.toUpperCase(),
          batch._id,
          user._id,
          email,
          `${firstName} ${lastName}`,
          req.ip || req.connection.remoteAddress,
          req.get("User-Agent"),
          "successful"
        );
        console.log("Signup code usage logged successfully");

        // Increment usage count in SignupCodeStatus
        const signupCodeStatus = await SignupCodeStatus.findOne({
          batchId: batch._id,
        });
        if (signupCodeStatus) {
          signupCodeStatus.incrementUsage();
          await signupCodeStatus.save();
          console.log("Signup code usage count incremented");
        }
      } catch (logError) {
        console.error("Error logging signup code usage:", logError);
        // Don't fail registration if logging fails
      }

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          assignedBatch: batch._id,
          batchName: batch.batchName,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          fullName: userDetails.fullName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error stack:", error);

      // Log failed registration attempt if we have the necessary data
      if (
        req.body.signupCode &&
        req.body.email &&
        req.body.firstName &&
        req.body.lastName
      ) {
        try {
          // Try to find the batch for logging
          const batch = await Batch.findOne({
            signupCode: req.body.signupCode.toUpperCase(),
            deletionStatus: "active",
            isActive: true,
          });

          await SignupCodeLog.logUsage(
            req.body.signupCode.toUpperCase(),
            batch?._id || null,
            null, // No user created
            req.body.email,
            `${req.body.firstName} ${req.body.lastName}`,
            req.ip || req.connection.remoteAddress,
            req.get("User-Agent"),
            "failed",
            error.message || "Server error during registration"
          );
        } catch (logError) {
          console.error("Error logging failed registration:", logError);
        }
      }

      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error: error.message,
      });
    }
  }
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password, expectedRole } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email, isActive: true })
        .select("+password")
        .populate("assignedBatch", "batchName");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if the user's role matches the expected role (if provided)
      if (expectedRole && user.role !== expectedRole) {
        return res.status(401).json({
          success: false,
          message: `Invalid credentials for ${expectedRole} role`,
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Get user details
      const userDetails = await UserDetails.findOne({ userId: user._id });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          assignedBatch: user.assignedBatch?._id,
          batchName: user.assignedBatch?.batchName,
          firstName: userDetails?.firstName,
          lastName: userDetails?.lastName,
          fullName: userDetails?.fullName,
          isProfileComplete: userDetails?.isProfileComplete || false,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }
);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with this email address",
        });
      }

      // Generate reset token
      const resetToken = user.generateResetToken();
      await user.save();

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      // Email content
      const message = `
      <h2>Password Reset Request</h2>
      <p>You have requested a password reset for your Chess Academy account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
    `;

      try {
        await sendEmail({
          to: user.email,
          subject: "Chess Academy - Password Reset Request",
          html: message,
        });

        res.json({
          success: true,
          message: "Password reset email sent successfully",
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);

        // Clear reset token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500).json({
          success: false,
          message: "Email could not be sent. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset request",
      });
    }
  }
);

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token } = req.params;
      const { password } = req.body;

      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
        isActive: true,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Set new password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // Generate new JWT token
      const jwtToken = generateToken(user._id);

      res.json({
        success: true,
        message: "Password reset successful",
        token: jwtToken,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset",
      });
    }
  }
);

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate(
      "assignedBatch",
      "batchName"
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const userDetails = await UserDetails.findOne({ userId: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        assignedBatch: user.assignedBatch?._id,
        batchName: user.assignedBatch?.batchName,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        fullName: userDetails?.fullName,
        isProfileComplete: userDetails?.isProfileComplete || false,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// @desc    Change password with current password verification
// @route   POST /api/auth/change-password
// @access  Private
router.post(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .exists()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const user = await User.findById(userId).select("+password");
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password change",
      });
    }
  }
);

// @desc    Request email change verification code
// @route   POST /api/auth/change-email-request
// @access  Private
router.post(
  "/change-email-request",
  protect,
  [
    body("newEmail")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { newEmail } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if new email is already in use
      const existingUser = await User.findOne({
        email: newEmail,
        _id: { $ne: userId },
        isActive: true,
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Remove any existing email change codes for this user
      await VerificationCode.deleteMany({
        userId: userId,
        type: "email_change",
      });

      // Create new verification code
      const verificationCode = new VerificationCode({
        userId: userId,
        email: user.email,
        code: code,
        type: "email_change",
        newEmail: newEmail,
      });

      await verificationCode.save();

      // Send verification email to new email address
      const message = `
        <h2>Email Change Verification</h2>
        <p>You have requested to change your email address for your Chess Academy account.</p>
        <p>Your verification code is: <strong style="font-size: 24px; color: #0d9488;">${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this email change, please ignore this email.</p>
      `;

      try {
        await sendEmail({
          to: newEmail,
          subject: "Chess Academy - Email Change Verification",
          html: message,
        });

        res.json({
          success: true,
          message: "Verification code sent to new email address",
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);

        // Clean up verification code if email fails
        await VerificationCode.deleteOne({ _id: verificationCode._id });

        res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Email change request error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during email change request",
      });
    }
  }
);

// @desc    Verify email change with code
// @route   POST /api/auth/change-email-verify
// @access  Private
router.post(
  "/change-email-verify",
  protect,
  [
    body("verificationCode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { verificationCode } = req.body;
      const userId = req.user.id;

      // Find verification code
      const codeDoc = await VerificationCode.findOne({
        userId: userId,
        code: verificationCode,
        type: "email_change",
        isUsed: false,
      });

      if (!codeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is valid (not expired, not too many attempts)
      if (!codeDoc.isValid()) {
        await codeDoc.incrementAttempts();
        return res.status(400).json({
          success: false,
          message: "Verification code has expired or too many attempts",
        });
      }

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if new email is still available
      const existingUser = await User.findOne({
        email: codeDoc.newEmail,
        _id: { $ne: userId },
        isActive: true,
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is no longer available",
        });
      }

      // Update user email
      user.email = codeDoc.newEmail;
      await user.save();

      // Mark verification code as used
      await codeDoc.markAsUsed();

      res.json({
        success: true,
        message: "Email changed successfully",
        newEmail: codeDoc.newEmail,
      });
    } catch (error) {
      console.error("Email change verification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during email verification",
      });
    }
  }
);

// @desc    Request forgot password verification code
// @route   POST /api/auth/forgot-password-code
// @access  Private (authenticated users only)
router.post(
  "/forgot-password-code",
  protect, // Add authentication middleware
  async (req, res) => {
    try {
      // Use authenticated user's email instead of request body
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Remove any existing password reset codes for this user
      await VerificationCode.deleteMany({
        userId: user._id,
        type: "password_reset",
      });

      // Create new verification code
      const verificationCode = new VerificationCode({
        userId: user._id,
        email: user.email,
        code: code,
        type: "password_reset",
      });

      await verificationCode.save();

      // Send verification email
      const message = `
        <h2>Password Reset Verification</h2>
        <p>You have requested to reset your password for your Chess Academy account.</p>
        <p>Your verification code is: <strong style="font-size: 24px; color: #0d9488;">${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: "Chess Academy - Password Reset Verification",
          html: message,
        });

        res.json({
          success: true,
          message: "Verification code sent to your email address",
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);

        // Clean up verification code if email fails
        await VerificationCode.deleteOne({ _id: verificationCode._id });

        res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Forgot password code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset request",
      });
    }
  }
);

// @desc    Verify forgot password code (without resetting password)
// @route   POST /api/auth/verify-password-code
// @access  Private (authenticated users only)
router.post(
  "/verify-password-code",
  [
    protect, // Add authentication middleware
    body("verificationCode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { verificationCode } = req.body;

      // Use authenticated user instead of email from request
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find verification code
      const codeDoc = await VerificationCode.findOne({
        userId: user._id,
        code: verificationCode,
        type: "password_reset",
        isUsed: false,
      });

      if (!codeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is valid (not expired, not too many attempts)
      if (!codeDoc.isValid()) {
        await codeDoc.incrementAttempts();
        return res.status(400).json({
          success: false,
          message: "Verification code has expired or too many attempts",
        });
      }

      // Increment attempts for tracking but don't mark as used
      await codeDoc.incrementAttempts();

      res.json({
        success: true,
        message: "Verification code is valid",
      });
    } catch (error) {
      console.error("Verify password code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during code verification",
      });
    }
  }
);

// @desc    Verify PIN code (for both email change and password reset)
// @route   POST /api/auth/verify-code
// @access  Private (authenticated users only)
router.post(
  "/verify-code",
  [
    protect, // Add authentication middleware
    body("verificationCode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
    body("type")
      .isIn(["email_change", "password_reset"])
      .withMessage("Invalid verification type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { verificationCode, type } = req.body;

      // Use authenticated user instead of email from request
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find verification code
      const codeDoc = await VerificationCode.findOne({
        userId: user._id,
        code: verificationCode,
        type: type,
        isUsed: false,
      });

      if (!codeDoc) {
        // Increment attempts for any existing code
        const existingCode = await VerificationCode.findOne({
          userId: user._id,
          type: type,
          isUsed: false,
        });
        if (existingCode) {
          await existingCode.incrementAttempts();
        }

        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is valid (not expired, not too many attempts)
      if (!codeDoc.isValid()) {
        await codeDoc.incrementAttempts();
        return res.status(400).json({
          success: false,
          message: "Verification code has expired or too many attempts",
        });
      }

      // Just verify, don't mark as used yet (that will happen in the final action)
      res.status(200).json({
        success: true,
        message: "Verification code is valid",
      });
    } catch (error) {
      console.error("Verify code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error occurred",
      });
    }
  }
);

// @desc    Reset password with verification code
// @route   POST /api/auth/reset-password-code
// @access  Private (authenticated users only)
router.post(
  "/reset-password-code",
  [
    protect, // Add authentication middleware
    body("verificationCode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { verificationCode, newPassword } = req.body;

      // Use authenticated user instead of email from request
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find verification code
      const codeDoc = await VerificationCode.findOne({
        userId: user._id,
        code: verificationCode,
        type: "password_reset",
        isUsed: false,
      });

      if (!codeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is valid (not expired, not too many attempts)
      if (!codeDoc.isValid()) {
        await codeDoc.incrementAttempts();
        return res.status(400).json({
          success: false,
          message: "Verification code has expired or too many attempts",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Mark verification code as used
      await codeDoc.markAsUsed();

      // Generate new JWT token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Password reset successfully",
        token: token,
      });
    } catch (error) {
      console.error("Reset password with code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset",
      });
    }
  }
);

// @desc    Request forgot password verification code (PUBLIC - for non-authenticated users)
// @route   POST /api/auth/public-forgot-password-code
// @access  Public
router.post(
  "/public-forgot-password-code",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with this email address",
        });
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Remove any existing password reset codes for this user
      await VerificationCode.deleteMany({
        userId: user._id,
        type: "password_reset",
      });

      // Create new verification code
      const verificationCode = new VerificationCode({
        userId: user._id,
        email: user.email,
        code: code,
        type: "password_reset",
      });

      await verificationCode.save();

      // Send verification email
      const message = `
        <h2>Password Reset Verification</h2>
        <p>You have requested to reset your password for your Chess Academy account.</p>
        <p>Your verification code is: <strong style="font-size: 24px; color: #0d9488;">${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
      `;

      try {
        await sendEmail({
          to: user.email,
          subject: "Chess Academy - Password Reset Verification",
          html: message,
        });

        res.json({
          success: true,
          message: "Verification code sent to your email address",
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);

        // Clean up verification code if email fails
        await VerificationCode.deleteOne({ _id: verificationCode._id });

        res.status(500).json({
          success: false,
          message: "Failed to send verification email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Public forgot password code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset request",
      });
    }
  }
);

// @desc    Verify forgot password code (PUBLIC - for non-authenticated users)
// @route   POST /api/auth/public-verify-password-code
// @access  Public
router.post(
  "/public-verify-password-code",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("verificationCode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, verificationCode } = req.body;

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with this email address",
        });
      }

      // Find verification code
      const codeDoc = await VerificationCode.findOne({
        userId: user._id,
        code: verificationCode,
        type: "password_reset",
        isUsed: false,
      });

      if (!codeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is valid (not expired, not too many attempts)
      if (!codeDoc.isValid()) {
        await codeDoc.incrementAttempts();
        return res.status(400).json({
          success: false,
          message: "Verification code has expired or too many attempts",
        });
      }

      // Increment attempts for tracking but don't mark as used
      await codeDoc.incrementAttempts();

      res.json({
        success: true,
        message: "Verification code is valid",
      });
    } catch (error) {
      console.error("Public verify password code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during code verification",
      });
    }
  }
);

// @desc    Reset password with verification code (PUBLIC - for non-authenticated users)
// @route   POST /api/auth/public-reset-password-code
// @access  Public
router.post(
  "/public-reset-password-code",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("verificationCode")
      .isLength({ min: 6, max: 6 })
      .withMessage("Verification code must be 6 digits"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, verificationCode, newPassword } = req.body;

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with this email address",
        });
      }

      // Find verification code
      const codeDoc = await VerificationCode.findOne({
        userId: user._id,
        code: verificationCode,
        type: "password_reset",
        isUsed: false,
      });

      if (!codeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }

      // Check if code is valid (not expired, not too many attempts)
      if (!codeDoc.isValid()) {
        await codeDoc.incrementAttempts();
        return res.status(400).json({
          success: false,
          message: "Verification code has expired or too many attempts",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Mark verification code as used
      await codeDoc.markAsUsed();

      // Generate new JWT token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Password reset successfully",
        token: token,
      });
    } catch (error) {
      console.error("Public reset password with code error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset",
      });
    }
  }
);

export default router;
