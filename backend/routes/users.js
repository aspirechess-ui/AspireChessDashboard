import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import VerificationCode from "../models/VerificationCode.js";
import { protect } from "../middleware/auth.js";
import uploadService from "../services/uploadService.js";
import {
  generateVerificationCode,
  sendEmailChangeVerification,
  sendPasswordResetVerification,
  sendEmailChangeConfirmation,
  sendPasswordChangeConfirmation,
} from "../utils/email.js";


const router = express.Router();

// Get multer configuration from upload service
const upload = uploadService.getMulterConfig();

// Get user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDetails = await UserDetails.findOne({ userId: req.user._id });

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName,
        profileImageUrl: userDetails?.profileImageUrl,
      },
      userDetails: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    // Update user basic info if provided
    const userUpdateData = {};
    if (profileData.email) userUpdateData.email = profileData.email;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    // Update or create user details
    const userDetailsData = {
      userId,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phoneNumber,
      alternatePhoneNumber: profileData.alternatePhoneNumber,
      address: profileData.address,
      gender: profileData.gender,
      nationality: profileData.nationality,

      // Role-specific fields
      dateOfBirth: profileData.dateOfBirth,
      parentName: profileData.parentName,
      parentPhoneNumber: profileData.parentPhoneNumber,
      emergencyContact: profileData.emergencyContact,
      qualification: profileData.qualification,
      experience: profileData.experience,
      specialization: profileData.specialization,
      bio: profileData.bio,
      designation: profileData.designation,
      department: profileData.department,
    };

    const userDetails = await UserDetails.findOneAndUpdate(
      { userId },
      userDetailsData,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      userDetails,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Upload profile image
router.post(
  "/profile/image",
  protect,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      console.log("Profile image upload request received");
      console.log("User ID:", req.user._id);
      console.log("File:", req.file);

      if (!req.file) {
        console.log("No file provided in request");
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const userId = req.user._id;

      // Get current user details to delete old image if exists
      const currentUserDetails = await UserDetails.findOne({ userId });

      // Delete old profile image if exists
      if (currentUserDetails?.profileImagePath) {
        await uploadService.deleteProfileImage(
          currentUserDetails.profileImagePath
        );
      }

      // Upload new image using upload service
      console.log("Uploading image using upload service...");
      const uploadResult = await uploadService.uploadProfileImage(
        req.file,
        userId
      );
      console.log("Upload result:", uploadResult);

      // Update user details with new profile image
      const userDetails = await UserDetails.findOneAndUpdate(
        { userId },
        {
          profileImagePath: uploadResult.path,
          profileImageUrl: uploadResult.url,
        },
        { upsert: true, new: true }
      );
      console.log("User details updated:", userDetails);

      res.json({
        success: true,
        message: "Profile image uploaded successfully",
        profileImageUrl: uploadResult.url,
        uploadProvider: uploadService.uploadProvider,
        userDetails,
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);

      // Handle specific multer errors
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }

      if (error.message.includes("Only image files")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
);

// Delete profile image
router.delete("/profile/image", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userDetails = await UserDetails.findOne({ userId });

    if (userDetails?.profileImagePath) {
      // Delete the image using upload service
      await uploadService.deleteProfileImage(userDetails.profileImagePath);

      // Update user details to remove profile image
      await UserDetails.findOneAndUpdate(
        { userId },
        {
          $unset: {
            profileImagePath: 1,
            profileImageUrl: 1,
          },
        }
      );
    }

    res.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user settings
router.get("/settings", protect, async (req, res) => {
  try {
    // For now, return empty settings - can be expanded later
    res.json({
      success: true,
      settings: {
        notifications: {
          email: true,
          push: true,
        },
        privacy: {
          profileVisible: true,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update user settings
router.put("/settings", protect, async (req, res) => {
  try {
    // For now, just return success - can be expanded later
    res.json({
      success: true,
      message: "Settings updated successfully",
      settings: req.body,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get upload service information
router.get("/upload-info", protect, async (req, res) => {
  try {
    const info = uploadService.getProviderInfo();
    res.json({
      success: true,
      uploadInfo: info,
    });
  } catch (error) {
    console.error("Error getting upload info:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Change password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    // Get user details for email
    const userDetails = await UserDetails.findOne({ userId });
    const userName = userDetails
      ? `${userDetails.firstName} ${userDetails.lastName}`
      : user.email;

    // Send confirmation email
    try {
      await sendPasswordChangeConfirmation(user.email, userName);
    } catch (emailError) {
      console.error(
        "Error sending password change confirmation email:",
        emailError
      );
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Request email change
router.post("/request-email-change", protect, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user._id;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email address is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Email address is already in use",
      });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new email is same as current
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from current email",
      });
    }

    // Invalidate any existing email change codes for this user
    await VerificationCode.invalidateExisting(userId, "email_change");

    // Generate verification code
    const code = generateVerificationCode();

    // Save verification code
    await VerificationCode.create({
      userId,
      email: newEmail.toLowerCase(),
      code,
      type: "email_change",
      newEmail: newEmail.toLowerCase(),
    });

    // Get user details for personalized email
    const userDetails = await UserDetails.findOne({ userId });
    const userName = userDetails
      ? `${userDetails.firstName} ${userDetails.lastName}`
      : user.email;

    // Send verification email to new email address
    await sendEmailChangeVerification(newEmail, code, userName);

    res.json({
      success: true,
      message: "Verification code sent to new email address",
    });
  } catch (error) {
    console.error("Error requesting email change:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Verify email change
router.post("/verify-email-change", protect, async (req, res) => {
  try {
    const { newEmail, verificationCode } = req.body;
    const userId = req.user._id;

    if (!newEmail || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "New email and verification code are required",
      });
    }

    // Find valid verification code
    const codeRecord = await VerificationCode.findValidCode(
      newEmail,
      verificationCode,
      "email_change"
    );

    if (!codeRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Check if code belongs to current user
    if (codeRecord.userId.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Increment attempts
    await codeRecord.incrementAttempts();

    // Check if too many attempts
    if (codeRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldEmail = user.email;

    // Update user email
    await User.findByIdAndUpdate(userId, { email: newEmail.toLowerCase() });

    // Mark verification code as used
    await codeRecord.markAsUsed();

    // Get user details for personalized email
    const userDetails = await UserDetails.findOne({ userId });
    const userName = userDetails
      ? `${userDetails.firstName} ${userDetails.lastName}`
      : newEmail;

    // Send confirmation emails to both old and new email addresses
    try {
      await sendEmailChangeConfirmation(oldEmail, newEmail, userName);
    } catch (emailError) {
      console.error("Error sending email change confirmation:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: "Email address updated successfully",
    });
  } catch (error) {
    console.error("Error verifying email change:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Request password reset
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      });
    }

    // Invalidate any existing password reset codes for this user
    await VerificationCode.invalidateExisting(user._id, "password_reset");

    // Generate verification code
    const code = generateVerificationCode();

    // Save verification code
    await VerificationCode.create({
      userId: user._id,
      email: email.toLowerCase(),
      code,
      type: "password_reset",
    });

    // Get user details for personalized email
    const userDetails = await UserDetails.findOne({ userId: user._id });
    const userName = userDetails
      ? `${userDetails.firstName} ${userDetails.lastName}`
      : user.email;

    // Send verification email
    await sendPasswordResetVerification(email, code, userName);

    res.json({
      success: true,
      message: "If the email exists, a reset code has been sent",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Reset password with code
router.post("/reset-password-with-code", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, verification code, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find valid verification code
    const codeRecord = await VerificationCode.findValidCode(
      email,
      code,
      "password_reset"
    );

    if (!codeRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Increment attempts
    await codeRecord.incrementAttempts();

    // Check if too many attempts
    if (codeRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    // Find user
    const user = await User.findById(codeRecord.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedNewPassword });

    // Mark verification code as used
    await codeRecord.markAsUsed();

    // Get user details for personalized email
    const userDetails = await UserDetails.findOne({ userId: user._id });
    const userName = userDetails
      ? `${userDetails.firstName} ${userDetails.lastName}`
      : user.email;

    // Send confirmation email
    try {
      await sendPasswordChangeConfirmation(user.email, userName);
    } catch (emailError) {
      console.error(
        "Error sending password reset confirmation email:",
        emailError
      );
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password with code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
