import express from "express";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import Batch from "../models/Batch.js";
import Class from "../models/Class.js";
import SignupCodeLog from "../models/SignupCodeLog.js";
import { protect, authorize } from "../middleware/auth.js";
import { normalizeUserDetailsImageUrl } from "../utils/imageUrl.js";

const router = express.Router();

// Admin Dashboard Stats
router.get(
  "/dashboard/stats",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      // Get total counts
      const totalStudents = await User.countDocuments({
        role: "student",
        isActive: true,
      });
      const totalTeachers = await User.countDocuments({
        role: "teacher",
        isActive: true,
      });
      const totalBatches = await Batch.countDocuments({ isActive: true });
      const totalClasses = await Class.countDocuments({ isActive: true });

      // Get active classes (you can define your own logic for "active")
      const activeClasses = await Class.countDocuments({
        isActive: true,
        // Add any additional criteria for "active" classes
      });

      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = await User.countDocuments({
        role: "student",
        createdAt: { $gte: thirtyDaysAgo },
      });

      const stats = {
        totalStudents,
        totalTeachers,
        totalBatches,
        totalClasses,
        activeClasses,
        recentSignups,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard statistics",
      });
    }
  }
);

// Get All Users with Details
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;

    // Build query
    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }

    // Search functionality
    if (search) {
      const userDetailsWithSearch = await UserDetails.find({
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      }).select("userId");

      const userIds = userDetailsWithSearch.map((detail) => detail.userId);

      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { _id: { $in: userIds } },
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get user details for each user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const userDetails = await UserDetails.findOne({ userId: user._id });
        const userObj = user.toObject();

        // Add batch information for students
        if (user.role === "student" && user.assignedBatch) {
          const batch = await Batch.findById(user.assignedBatch).select(
            "batchName"
          );
          userObj.assignedBatch = batch?.batchName || "Unknown Batch";
        }

        return {
          ...userObj,
          userDetails: normalizeUserDetailsImageUrl(userDetails),
        };
      })
    );

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      users: usersWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});

// Create Admin User
router.post("/users/admin", protect, authorize("admin"), async (req, res) => {
  try {
    console.log("Creating admin user with data:", req.body);

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      alternatePhoneNumber,
      gender,
      nationality,
      street,
      city,
      state,
      country,
      zipCode,
      designation,
      department,
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error:
          "Email, password, first name, last name, and phone number are required",
      });
    }

    // Role-specific validation
    if (!designation) {
      return res.status(400).json({
        success: false,
        error: "Designation is required for admin accounts",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role: "admin",
      isActive: true,
      accountCreationType: "admin_created",
      createdBy: req.user._id,
    });

    await user.save();

    // Create user details with all provided fields
    const userDetailsData = {
      userId: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phoneNumber: phoneNumber.trim(),
      designation: designation.trim(),
      isProfileComplete: true,
    };

    // Add optional fields if provided
    if (alternatePhoneNumber)
      userDetailsData.alternatePhoneNumber = alternatePhoneNumber.trim();
    if (gender) userDetailsData.gender = gender;
    if (nationality) userDetailsData.nationality = nationality.trim();
    if (department) userDetailsData.department = department.trim();

    // Add address if any address fields are provided
    if (street || city || state || country || zipCode) {
      userDetailsData.address = {
        street: street?.trim() || "",
        city: city?.trim() || "",
        state: state?.trim() || "",
        country: country?.trim() || "",
        zipCode: zipCode?.trim() || "",
      };
    }

    const userDetails = new UserDetails(userDetailsData);
    await userDetails.save();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create admin user",
    });
  }
});

// Create Teacher User
router.post("/users/teacher", protect, authorize("admin"), async (req, res) => {
  try {
    console.log("Creating teacher user with data:", req.body);

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      alternatePhoneNumber,
      gender,
      nationality,
      street,
      city,
      state,
      country,
      zipCode,
      qualification,
      experience,
      specialization,
      bio,
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error:
          "Email, password, first name, last name, and phone number are required",
      });
    }

    // Role-specific validation
    if (!qualification || !specialization) {
      return res.status(400).json({
        success: false,
        error:
          "Qualification and specialization are required for teacher accounts",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role: "teacher",
      isActive: true,
      accountCreationType: "admin_created",
      createdBy: req.user._id,
    });

    await user.save();

    // Create user details with all provided fields
    const userDetailsData = {
      userId: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phoneNumber: phoneNumber.trim(),
      qualification: qualification.trim(),
      experience: experience ? parseInt(experience) : 0,
      specialization: specialization.trim(),
      isProfileComplete: true,
    };

    // Add optional fields if provided
    if (alternatePhoneNumber)
      userDetailsData.alternatePhoneNumber = alternatePhoneNumber.trim();
    if (gender) userDetailsData.gender = gender;
    if (nationality) userDetailsData.nationality = nationality.trim();
    if (bio) userDetailsData.bio = bio.trim();

    // Add address if any address fields are provided
    if (street || city || state || country || zipCode) {
      userDetailsData.address = {
        street: street?.trim() || "",
        city: city?.trim() || "",
        state: state?.trim() || "",
        country: country?.trim() || "",
        zipCode: zipCode?.trim() || "",
      };
    }

    const userDetails = new UserDetails(userDetailsData);
    await userDetails.save();

    res.status(201).json({
      success: true,
      message: "Teacher user created successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    console.error("Error creating teacher user:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create teacher user",
    });
  }
});

// Get User Details
router.get("/users/:userId", protect, authorize("admin"), async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user details
    const userDetails = await UserDetails.findOne({ userId });

    // Add batch information for students
    let batchInfo = null;
    if (user.role === "student" && user.assignedBatch) {
      const batch = await Batch.findById(user.assignedBatch).select(
        "batchName"
      );
      batchInfo = batch?.batchName || "Unknown Batch";
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        userDetails: userDetails || null,
        assignedBatch: batchInfo,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user details",
    });
  }
});

// Update User
router.put("/users/:userId", protect, authorize("admin"), async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Don't allow updating yourself through this endpoint
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: "Use the profile update endpoint to update your own account",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update user basic info if provided
    const userUpdateData = {};
    if (updateData.email) userUpdateData.email = updateData.email;
    if (updateData.isActive !== undefined)
      userUpdateData.isActive = updateData.isActive;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    // Update user details if provided
    if (updateData.userDetails) {
      await UserDetails.findOneAndUpdate({ userId }, updateData.userDetails, {
        upsert: true,
        new: true,
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
});

// Delete User (Hard delete - permanently removes from database)
router.delete(
  "/users/:userId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log("Permanently deleting user with ID:", userId);

      // Don't allow deleting yourself
      if (userId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: "You cannot delete your own account",
        });
      }

      // Find user first to check if it exists and get user info
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Admin can delete any user account (admin, teacher, or student)
      console.log(`Admin deleting ${user.role} account:`, user.email);

      // Get user details for cleanup
      const userDetails = await UserDetails.findOne({ userId });

      // If this is a student, remove them from all batches they're enrolled in
      if (user.role === "student") {
        try {
          const result = await Batch.removeStudentFromAllBatches(userId);
          console.log(`Student removal result:`, result);
        } catch (batchError) {
          console.error("Error removing student from batches:", batchError);
          // Continue with user deletion even if batch cleanup fails
        }
      }

      // Update SignupCodeLog entries to mark user as deleted
      // We don't delete the logs to maintain audit trail
      try {
        await SignupCodeLog.updateMany(
          { userId: userId },
          {
            $set: {
              userName: `[DELETED USER] ${
                userDetails?.firstName || "Unknown"
              } ${userDetails?.lastName || "User"}`,
              userEmail: `[DELETED] ${user.email}`,
              registrationStatus:
                user.role === "student" ? "failed" : "successful", // Mark as failed if student was deleted
              failureReason:
                user.role === "student"
                  ? "Student account was deleted by admin"
                  : undefined,
            },
          }
        );
        console.log("SignupCodeLog entries updated for deleted user");
      } catch (logError) {
        console.error("Error updating signup code logs:", logError);
        // Continue with user deletion even if log update fails
      }

      // Delete profile image if exists
      if (userDetails?.profileImagePath) {
        try {
          const uploadService = await import("../services/uploadService.js");
          await uploadService.default.deleteProfileImage(
            userDetails.profileImagePath
          );
          console.log("Profile image deleted for user:", userId);
        } catch (imageError) {
          console.error("Error deleting profile image:", imageError);
          // Continue with user deletion even if image deletion fails
        }
      }

      // Delete user details first (due to foreign key constraint)
      await UserDetails.deleteOne({ userId });
      console.log("User details deleted for user:", userId);

      // Delete the user from the database
      await User.findByIdAndDelete(userId);
      console.log("User permanently deleted from database:", userId);

      res.json({
        success: true,
        message: "User permanently deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete user",
      });
    }
  }
);

// Placeholder routes for future implementation
// These will return appropriate responses until fully implemented

// Batch Management Routes
router.get("/batches", protect, authorize("admin"), async (req, res) => {
  res.json({
    success: true,
    batches: [],
    message: "Batch management not yet implemented",
  });
});

router.post("/batches", protect, authorize("admin"), async (req, res) => {
  res.status(501).json({
    success: false,
    error: "Batch creation not yet implemented",
  });
});

router.put(
  "/batches/:batchId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Batch update not yet implemented",
    });
  }
);

router.delete(
  "/batches/:batchId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Batch deletion not yet implemented",
    });
  }
);

// Class Management Routes
router.get("/classes", protect, authorize("admin"), async (req, res) => {
  res.json({
    success: true,
    classes: [],
    message: "Class management not yet implemented",
  });
});

router.get(
  "/classes/:classId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Class details not yet implemented",
    });
  }
);

router.put(
  "/classes/:classId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Class update not yet implemented",
    });
  }
);

router.delete(
  "/classes/:classId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Class deletion not yet implemented",
    });
  }
);

// Announcement Management Routes
router.get("/announcements", protect, authorize("admin"), async (req, res) => {
  res.json({
    success: true,
    announcements: [],
    message: "Announcement management not yet implemented",
  });
});

router.post("/announcements", protect, authorize("admin"), async (req, res) => {
  res.status(501).json({
    success: false,
    error: "Announcement creation not yet implemented",
  });
});

router.put(
  "/announcements/:announcementId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Announcement update not yet implemented",
    });
  }
);

router.delete(
  "/announcements/:announcementId",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.status(501).json({
      success: false,
      error: "Announcement deletion not yet implemented",
    });
  }
);

// System Settings Routes
router.get("/settings", protect, authorize("admin"), async (req, res) => {
  res.json({
    success: true,
    settings: {
      academyName: "Chess Academy",
      academyEmail: "admin@chessacademy.com",
      academyPhone: "+1234567890",
      academyAddress: "123 Chess Street, Game City",
      maxStudentsPerBatch: 30,
      maxStudentsPerClass: 20,
      enableLichessIntegration: true,
      enableEmailNotifications: true,
    },
    message: "System settings loaded successfully",
  });
});

router.put("/settings", protect, authorize("admin"), async (req, res) => {
  res.status(501).json({
    success: false,
    error: "System settings update not yet implemented",
  });
});

// Analytics Routes
router.get(
  "/analytics/users",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.json({
      success: true,
      analytics: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        usersByRole: {
          admin: 0,
          teacher: 0,
          student: 0,
        },
      },
      message: "User analytics not yet implemented",
    });
  }
);

router.get(
  "/analytics/batches",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.json({
      success: true,
      analytics: {
        totalBatches: 0,
        activeBatches: 0,
        averageStudentsPerBatch: 0,
      },
      message: "Batch analytics not yet implemented",
    });
  }
);

router.get(
  "/analytics/classes",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.json({
      success: true,
      analytics: {
        totalClasses: 0,
        activeClasses: 0,
        averageStudentsPerClass: 0,
      },
      message: "Class analytics not yet implemented",
    });
  }
);

export default router;
