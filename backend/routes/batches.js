import express from "express";
import Batch from "../models/Batch.js";
import SignupCodeStatus from "../models/SignupCodeStatus.js";
import SignupCodeLog from "../models/SignupCodeLog.js";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import { protect, authorize } from "../middleware/auth.js";
import { imageURL } from "../utils/imageUrl.js";

const router = express.Router();

// @desc    Get all batches for teachers (simplified)
// @route   GET /api/batches/teacher
// @access  Private (Teacher only)
router.get("/teacher", protect, authorize("teacher"), async (req, res) => {
  try {
    const {
      limit = 100,
      search = "",
      academicYear = "",
      status = "active",
    } = req.query;

    // Build query for active batches only
    const query = {
      deletionStatus: "active",
      isActive: true,
    };

    // Search by batch name
    if (search) {
      query.batchName = { $regex: search, $options: "i" };
    }

    // Filter by academic year
    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Execute query
    const batches = await Batch.find(query)
      .select(
        "batchName description academicYear currentStudents maxStudents hasStudentLimit isActive"
      )
      .sort({ createdAt: -1 })
      .limit(limit * 1);

    res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Error fetching batches for teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching batches",
      error: error.message,
    });
  }
});

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private (Admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      academicYear = "",
      status = "active",
    } = req.query;

    // Build query
    const query = {};

    // Search by batch name
    if (search) {
      query.batchName = { $regex: search, $options: "i" };
    }

    // Filter by academic year
    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Filter by deletion status
    if (status === "active") {
      query.deletionStatus = "active";
      query.isActive = true;
    } else if (status === "archived") {
      query.deletionStatus = { $in: ["draft_deletion", "permanently_deleted"] };
    }

    // Execute query with pagination
    const batches = await Batch.find(query)
      .populate("createdBy", "email")
      .populate("enrolledStudents", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Batch.countDocuments(query);

    // Get signup code status for each batch
    const batchesWithStatus = await Promise.all(
      batches.map(async (batch) => {
        const signupCodeStatus = await SignupCodeStatus.findOne({
          batchId: batch._id,
        });

        return {
          ...batch.toJSON(),
          signupCodeStatus: signupCodeStatus || null,
        };
      })
    );

    res.json({
      success: true,
      data: batchesWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching batches",
      error: error.message,
    });
  }
});

// @desc    Get all activity logs across batches
// @route   GET /api/batches/activity-logs
// @access  Private (Admin only)
router.get("/activity-logs", protect, authorize("admin"), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      batchId = "",
      status = "",
      startDate = "",
      endDate = "",
    } = req.query;

    // Build query
    const query = {};

    // Filter by batch if specified (handle multiple values)
    if (batchId) {
      const batchIds = batchId
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
      if (batchIds.length === 1) {
        query.batchId = batchIds[0];
      } else if (batchIds.length > 1) {
        query.batchId = { $in: batchIds };
      }
    }

    // Filter by registration status (handle multiple values)
    if (status) {
      const statuses = status
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      if (statuses.length === 1) {
        query.registrationStatus = statuses[0];
      } else if (statuses.length > 1) {
        query.registrationStatus = { $in: statuses };
      }
    }

    // Date range filter
    if (startDate || endDate) {
      query.usedAt = {};
      if (startDate) {
        query.usedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.usedAt.$lte = new Date(endDate);
      }
    }

    // Search by user name, email, or signup code
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { signupCode: { $regex: search, $options: "i" } },
      ];
    }

    // Get activity logs with pagination
    const logs = await SignupCodeLog.find(query)
      .populate({
        path: "batchId",
        select: "batchName academicYear",
      })
      .populate("userId", "email")
      .sort({ usedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Manually fetch UserDetails for users in logs
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const logObj = log.toJSON();
        if (logObj.userId && logObj.userId._id) {
          const userDetails = await UserDetails.findOne({
            userId: logObj.userId._id,
          }).select("firstName lastName");

          if (userDetails) {
            logObj.userId.userDetails = {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
            };
          }
        }
        return logObj;
      })
    );

    // Get total count
    const total = await SignupCodeLog.countDocuments(query);

    // Get overall statistics
    const stats = await SignupCodeLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$registrationStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const overallStats = {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
    };

    stats.forEach((stat) => {
      overallStats[stat._id] = stat.count;
      overallStats.total += stat.count;
    });

    res.json({
      success: true,
      data: {
        logs: logsWithDetails,
        stats: overallStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity logs",
      error: error.message,
    });
  }
});

// @desc    Get batch students
// @route   GET /api/batches/:id/students
// @access  Private (Teacher, Admin)
router.get(
  "/:id/students",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const batch = await Batch.findById(req.params.id)
        .populate("enrolledStudents", "email role createdAt")
        .select("batchName enrolledStudents");

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      // Fetch UserDetails for enrolled students
      const studentsWithDetails = [];

      if (batch.enrolledStudents && batch.enrolledStudents.length > 0) {
        const studentIds = batch.enrolledStudents.map((student) => student._id);
        const userDetailsArray = await UserDetails.find({
          userId: { $in: studentIds },
        });

        // Map user details to students
        studentsWithDetails.push(
          ...batch.enrolledStudents.map((student) => {
            const details = userDetailsArray.find(
              (detail) => detail.userId.toString() === student._id.toString()
            );
            return {
              _id: student._id,
              email: student.email,
              role: student.role,
              createdAt: student.createdAt,
              userDetails: details ? normalizeUserDetailsImageUrl(details) : null,
            };
          })
        );
      }

      res.json({
        success: true,
        data: {
          batchName: batch.batchName,
          students: studentsWithDetails,
        },
      });
    } catch (error) {
      console.error("Error fetching batch students:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching batch students",
        error: error.message,
      });
    }
  }
);

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private (Admin only)
router.get("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("createdBy", "email")
      .populate("enrolledStudents", "email");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Manually fetch UserDetails for enrolled students
    const batchWithDetails = batch.toJSON();
    if (
      batchWithDetails.enrolledStudents &&
      batchWithDetails.enrolledStudents.length > 0
    ) {
      const studentIds = batchWithDetails.enrolledStudents.map(
        (student) => student._id
      );
      const userDetails = await UserDetails.find({
        userId: { $in: studentIds },
      }).select("userId firstName lastName profileImageUrl");

      // Map user details to students
      batchWithDetails.enrolledStudents = batchWithDetails.enrolledStudents.map(
        (student) => {
          const details = userDetails.find(
            (detail) => detail.userId.toString() === student._id.toString()
          );
          return {
            ...student,
            userDetails: details
              ? {
                  firstName: details.firstName,
                  lastName: details.lastName,
                  profileImageUrl: imageURL(details.profileImageUrl),
                }
              : null,
          };
        }
      );
    }

    // Get signup code status
    const signupCodeStatus = await SignupCodeStatus.findOne({
      batchId: batch._id,
    }).populate("activatedBy deactivatedBy", "email");

    // Get usage statistics
    const usageStats = await SignupCodeLog.getBatchUsageStats(batch._id);

    // Get recent usage logs
    const recentUsageLogs = await SignupCodeLog.getRecentUsage(batch._id, 20);

    // Manually fetch UserDetails for recent usage logs
    const recentUsage = await Promise.all(
      recentUsageLogs.map(async (log) => {
        const logObj = log.toJSON();
        if (logObj.userId && logObj.userId._id) {
          const userDetails = await UserDetails.findOne({
            userId: logObj.userId._id,
          }).select("firstName lastName");

          if (userDetails) {
            logObj.userId.userDetails = {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
            };
          }
        }
        return logObj;
      })
    );

    res.json({
      success: true,
      data: {
        batch: batchWithDetails,
        signupCodeStatus,
        usageStats,
        recentUsage,
      },
    });
  } catch (error) {
    console.error("Error fetching batch:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching batch",
      error: error.message,
    });
  }
});

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private (Admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    console.log("Received batch creation request:", req.body);
    console.log("User from middleware:", req.user);
    const {
      batchName,
      description,
      hasStudentLimit,
      maxStudents,
      academicYear,
    } = req.body;

    // Validate required fields
    if (!batchName || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "Batch name and academic year are required",
      });
    }

    // Validate maxStudents if hasStudentLimit is true
    if (hasStudentLimit && (!maxStudents || maxStudents < 1)) {
      return res.status(400).json({
        success: false,
        message: "Maximum students is required when student limit is enabled",
      });
    }

    // Check if batch name already exists for the academic year
    const existingBatch = await Batch.findOne({
      batchName,
      academicYear,
      deletionStatus: "active",
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch with this name already exists for the academic year",
      });
    }

    // Create batch
    const batchData = {
      batchName,
      description,
      hasStudentLimit: hasStudentLimit || false,
      academicYear,
      createdBy: req.user._id,
    };

    // Only set maxStudents if hasStudentLimit is true
    if (hasStudentLimit) {
      batchData.maxStudents = maxStudents;
    }

    console.log("Creating batch with data:", batchData);
    const batch = new Batch(batchData);
    console.log("Batch before save - signupCode:", batch.signupCode);

    // Generate signup code manually if not set
    if (!batch.signupCode) {
      console.log("Manually generating signup code...");
      batch.generateSignupCode();
      console.log("Generated signup code:", batch.signupCode);
    }

    await batch.save();
    console.log("Batch saved successfully:", batch._id);
    console.log("Batch after save - signupCode:", batch.signupCode);

    // Create signup code status
    let signupCodeStatus = null;
    try {
      signupCodeStatus = await SignupCodeStatus.createForBatch(
        batch.signupCode,
        batch._id,
        req.user._id
      );
      console.log("SignupCodeStatus created successfully");
    } catch (statusError) {
      console.error("Error creating SignupCodeStatus:", statusError);
      // Continue without failing the batch creation
    }

    // Populate created batch
    await batch.populate("createdBy", "email");

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: {
        batch: batch.toJSON(),
        signupCodeStatus,
      },
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(500).json({
      success: false,
      message: "Error creating batch",
      error: error.message,
    });
  }
});

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const {
      batchName,
      description,
      hasStudentLimit,
      maxStudents,
      academicYear,
    } = req.body;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Validate maxStudents if hasStudentLimit is true
    if (hasStudentLimit && (!maxStudents || maxStudents < 1)) {
      return res.status(400).json({
        success: false,
        message: "Maximum students is required when student limit is enabled",
      });
    }

    // Check if batch name already exists for the academic year (excluding current batch)
    if (batchName && academicYear) {
      const existingBatch = await Batch.findOne({
        batchName,
        academicYear,
        deletionStatus: "active",
        _id: { $ne: req.params.id },
      });

      if (existingBatch) {
        return res.status(400).json({
          success: false,
          message: "Batch with this name already exists for the academic year",
        });
      }
    }

    // Update fields
    if (batchName) batch.batchName = batchName;
    if (description !== undefined) batch.description = description;
    if (hasStudentLimit !== undefined) {
      batch.hasStudentLimit = hasStudentLimit;
      // Only update maxStudents if hasStudentLimit is true
      if (hasStudentLimit && maxStudents) {
        batch.maxStudents = maxStudents;
      } else if (!hasStudentLimit) {
        // Clear maxStudents if limit is disabled
        batch.maxStudents = undefined;
      }
    } else if (maxStudents && batch.hasStudentLimit) {
      // Update maxStudents only if limit is enabled
      batch.maxStudents = maxStudents;
    }
    if (academicYear) batch.academicYear = academicYear;

    await batch.save();
    await batch.populate("createdBy", "email");

    res.json({
      success: true,
      message: "Batch updated successfully",
      data: batch.toJSON(),
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    res.status(500).json({
      success: false,
      message: "Error updating batch",
      error: error.message,
    });
  }
});

// @desc    Reset signup code
// @route   POST /api/batches/:id/reset-signup-code
// @access  Private (Admin only)
router.post(
  "/:id/reset-signup-code",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { reason } = req.body;

      const batch = await Batch.findById(req.params.id);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      // Reset signup code in batch
      const newSignupCode = batch.resetSignupCode();
      await batch.save();

      // Update signup code status
      let signupCodeStatus = await SignupCodeStatus.findOne({
        batchId: batch._id,
      });

      if (signupCodeStatus) {
        signupCodeStatus.reset(newSignupCode, req.user._id, reason);
        await signupCodeStatus.save();
      } else {
        // Create new status if doesn't exist
        signupCodeStatus = await SignupCodeStatus.createForBatch(
          newSignupCode,
          batch._id,
          req.user._id
        );
      }

      res.json({
        success: true,
        message: "Signup code reset successfully",
        data: {
          newSignupCode,
          signupCodeStatus,
        },
      });
    } catch (error) {
      console.error("Error resetting signup code:", error);
      res.status(500).json({
        success: false,
        message: "Error resetting signup code",
        error: error.message,
      });
    }
  }
);

// @desc    Toggle signup code status
// @route   POST /api/batches/:id/toggle-signup-code
// @access  Private (Admin only)
router.post(
  "/:id/toggle-signup-code",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { reason } = req.body;

      const batch = await Batch.findById(req.params.id);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      // Get or create signup code status
      let signupCodeStatus = await SignupCodeStatus.findOne({
        batchId: batch._id,
      });

      if (!signupCodeStatus) {
        signupCodeStatus = await SignupCodeStatus.createForBatch(
          batch.signupCode,
          batch._id,
          req.user._id
        );
      }

      // Toggle status
      if (signupCodeStatus.isActive) {
        signupCodeStatus.deactivate(req.user._id, reason);
      } else {
        signupCodeStatus.activate(req.user._id, reason);
      }

      await signupCodeStatus.save();

      res.json({
        success: true,
        message: `Signup code ${
          signupCodeStatus.isActive ? "activated" : "deactivated"
        } successfully`,
        data: signupCodeStatus,
      });
    } catch (error) {
      console.error("Error toggling signup code status:", error);
      res.status(500).json({
        success: false,
        message: "Error toggling signup code status",
        error: error.message,
      });
    }
  }
);

// @desc    Get signup code usage logs
// @route   GET /api/batches/:id/usage-logs
// @access  Private (Admin only)
router.get("/:id/usage-logs", protect, authorize("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Get usage logs with pagination
    const usageLogs = await SignupCodeLog.find({ batchId: batch._id })
      .populate("userId", "email")
      .sort({ usedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Manually fetch UserDetails for usage logs
    const logs = await Promise.all(
      usageLogs.map(async (log) => {
        const logObj = log.toJSON();
        if (logObj.userId && logObj.userId._id) {
          const userDetails = await UserDetails.findOne({
            userId: logObj.userId._id,
          }).select("firstName lastName");

          if (userDetails) {
            logObj.userId.userDetails = {
              firstName: userDetails.firstName,
              lastName: userDetails.lastName,
            };
          }
        }
        return logObj;
      })
    );

    // Get total count
    const total = await SignupCodeLog.countDocuments({ batchId: batch._id });

    // Get usage statistics
    const stats = await SignupCodeLog.getBatchUsageStats(batch._id);

    res.json({
      success: true,
      data: {
        logs,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching usage logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching usage logs",
      error: error.message,
    });
  }
});

// @desc    Delete batch (soft delete)
// @route   DELETE /api/batches/:id
// @access  Private (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { reason } = req.body;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Mark for deletion
    batch.deletionStatus = "draft_deletion";
    batch.markedForDeletionAt = new Date();
    batch.markedForDeletionBy = req.user._id;
    batch.deletionReason = reason;
    batch.isActive = false;

    await batch.save();

    // Deactivate signup code
    const signupCodeStatus = await SignupCodeStatus.findOne({
      batchId: batch._id,
    });

    if (signupCodeStatus) {
      signupCodeStatus.deactivate(req.user._id, "Batch marked for deletion");
      await signupCodeStatus.save();
    }

    res.json({
      success: true,
      message: "Batch marked for deletion successfully",
      data: batch.toJSON(),
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting batch",
      error: error.message,
    });
  }
});

export default router;
