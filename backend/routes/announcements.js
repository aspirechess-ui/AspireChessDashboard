import express from "express";
import Announcement from "../models/Announcement.js";
import Batch from "../models/Batch.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";
import { imageURL } from "../utils/imageUrl.js";

const router = express.Router();

// @desc    Get all announcements for the current user
// @route   GET /api/announcements
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const userBatch = req.user.assignedBatch;

    let announcements;

    // Admin and Teacher users should see ALL announcements
    if (userRole === "admin" || userRole === "teacher") {
      announcements = await Announcement.find({ isActive: true })
        .populate({
          path: "createdBy",
          select: "email role",
          populate: {
            path: "userDetails",
            select: "firstName lastName fullName",
          },
        })
        .populate("targetBatch", "batchName academicYear")
        .populate("targetClass", "className description")
        .sort({ createdAt: -1 });
    } else {
      // For other users, use the existing logic
      // Get user's class IDs if they are a student or teacher
      let userClasses = [];
      if (userRole === "student") {
        const classes = await Class.find({
          enrolledStudents: userId,
          isActive: true,
        }).select("_id");
        userClasses = classes.map((c) => c._id);
      } else if (userRole === "teacher") {
        const classes = await Class.find({
          teacherId: userId,
        }).select("_id");
        userClasses = classes.map((c) => c._id);
      }

      announcements = await Announcement.getAnnouncementsForUser(
        userId,
        userRole,
        userBatch,
        userClasses
      );
    }

    res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
});

// @desc    Get announcements by type
// @route   GET /api/announcements/type/:type
// @access  Private
router.get("/type/:type", protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { batchId, classId } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!["academy", "batch", "class"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement type",
      });
    }

    let query = {
      type,
      isActive: true,
    };

    // Add specific filters based on type
    if (type === "batch" && batchId) {
      query.targetBatch = batchId;
    } else if (type === "class" && classId) {
      query.targetClass = classId;
    }

    // For students, ensure they have access to the announcements
    if (userRole === "student") {
      if (type === "batch" && batchId) {
        // Check if student is in the batch
        if (req.user.assignedBatch?.toString() !== batchId) {
          return res.status(403).json({
            success: false,
            message: "Access denied to this batch's announcements",
          });
        }
      } else if (type === "class" && classId) {
        // Check if student is enrolled in the class
        const classExists = await Class.findOne({
          _id: classId,
          enrolledStudents: userId,
          isActive: true,
        });
        if (!classExists) {
          return res.status(403).json({
            success: false,
            message: "Access denied to this class's announcements",
          });
        }
      }
    }

    const announcements = await Announcement.find(query)
      .populate({
        path: "createdBy",
        select: "email role",
        populate: {
          path: "userDetails",
          select: "firstName lastName fullName",
        },
      })
      .populate("targetBatch", "batchName academicYear")
      .populate("targetClass", "className description")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements by type:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
});

// @desc    Get batches and classes for announcement creation
// @route   GET /api/announcements/targets
// @access  Private (Admin & Teacher only)
router.get(
  "/targets",
  protect,
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      let batches, classes;

      if (req.user.role === "admin" || req.user.role === "teacher") {
        // Admins and teachers can see all batches and classes
        batches = await Batch.find({ isActive: true })
          .select("_id batchName academicYear")
          .sort({ academicYear: -1, batchName: 1 });

        classes = await Class.find()
          .populate("linkedBatch", "batchName academicYear")
          .populate("teacherId", "email")
          .select("_id className description linkedBatch teacherId")
          .sort({ "linkedBatch.batchName": 1, className: 1 });
      }

      res.json({
        success: true,
        data: {
          batches,
          classes,
        },
      });
    } catch (error) {
      console.error("Error fetching announcement targets:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching announcement targets",
        error: error.message,
      });
    }
  }
);

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate({
        path: "createdBy",
        select: "email role",
        populate: {
          path: "userDetails",
          select: "firstName lastName fullName",
        },
      })
      .populate("targetBatch", "batchName academicYear")
      .populate("targetClass", "className description");

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check access permissions
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === "student") {
      // Students can only view announcements they have access to
      const userBatch = req.user.assignedBatch;
      const userClasses = await Class.find({
        enrolledStudents: userId,
        isActive: true,
      }).select("_id");
      const userClassIds = userClasses.map((c) => c._id.toString());

      const hasAccess =
        announcement.type === "academy" ||
        (announcement.type === "batch" &&
          announcement.targetBatch?.toString() === userBatch?.toString()) ||
        (announcement.type === "class" &&
          userClassIds.includes(announcement.targetClass?.toString()));

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this announcement",
        });
      }
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcement",
      error: error.message,
    });
  }
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Admin & Teacher only)
router.post("/", protect, authorize("admin", "teacher"), async (req, res) => {
  try {
    const { title, content, type, targetBatch, targetClass } = req.body;

    // Validation
    if (!title || !content || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and type are required",
      });
    }

    if (!["academy", "batch", "class"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement type",
      });
    }

    // Validate required fields based on type
    if (type === "batch" && !targetBatch) {
      return res.status(400).json({
        success: false,
        message: "Target batch is required for batch announcements",
      });
    }

    if (type === "class" && !targetClass) {
      return res.status(400).json({
        success: false,
        message: "Target class is required for class announcements",
      });
    }

    // Verify batch exists
    if (targetBatch) {
      const batch = await Batch.findById(targetBatch);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Target batch not found",
        });
      }
    }

    // Verify class exists
    if (targetClass) {
      const classItem = await Class.findById(targetClass);
      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Target class not found",
        });
      }

      // Teachers can create announcements for any class
    }

    // Both admins and teachers can create academy announcements

    const announcementData = {
      title: title.trim(),
      content: content.trim(),
      type,
      createdBy: req.user._id,
    };

    if (targetBatch) {
      announcementData.targetBatch = targetBatch;
    }

    if (targetClass) {
      announcementData.targetClass = targetClass;
    }

    const announcement = await Announcement.create(announcementData);

    // Populate the created announcement
    await announcement.populate([
      {
        path: "createdBy",
        select: "email role",
        populate: {
          path: "userDetails",
          select: "firstName lastName fullName",
        },
      },
      { path: "targetBatch", select: "batchName academicYear" },
      { path: "targetClass", select: "className description" },
    ]);

    res.status(201).json({
      success: true,
      data: announcement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message,
    });
  }
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin & Teacher only - own announcements)
router.put("/:id", protect, authorize("admin", "teacher"), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Check ownership
    if (
      req.user.role === "teacher" &&
      announcement.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own announcements",
      });
    }

    const { title, content, isActive } = req.body;

    // Update fields
    if (title !== undefined) announcement.title = title.trim();
    if (content !== undefined) announcement.content = content.trim();
    if (isActive !== undefined) announcement.isActive = isActive;

    await announcement.save();

    // Populate the updated announcement
    await announcement.populate([
      {
        path: "createdBy",
        select: "email role",
        populate: {
          path: "userDetails",
          select: "firstName lastName fullName",
        },
      },
      { path: "targetBatch", select: "batchName academicYear" },
      { path: "targetClass", select: "className description" },
    ]);

    res.json({
      success: true,
      data: announcement,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error: error.message,
    });
  }
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin & Teacher only - own announcements)
router.delete(
  "/:id",
  protect,
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id);

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      // Check ownership
      if (
        req.user.role === "teacher" &&
        announcement.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only delete your own announcements",
        });
      }

      await Announcement.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting announcement",
        error: error.message,
      });
    }
  }
);

// @desc    Mark announcement as read
// @route   POST /api/announcements/:id/read
// @access  Private
router.post("/:id/read", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await announcement.markAsReadBy(req.user._id);

    res.json({
      success: true,
      message: "Announcement marked as read",
    });
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking announcement as read",
      error: error.message,
    });
  }
});

// @desc    Get unread announcements count
// @route   GET /api/announcements/unread/count
// @access  Private
router.get("/unread/count", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const userBatch = req.user.assignedBatch;

    // Get user's class IDs
    let userClasses = [];
    if (userRole === "student") {
      const classes = await Class.find({
        enrolledStudents: userId,
        isActive: true,
      }).select("_id");
      userClasses = classes.map((c) => c._id);
    } else if (userRole === "teacher") {
      const classes = await Class.find({
        teacherId: userId,
      }).select("_id");
      userClasses = classes.map((c) => c._id);
    }

    const count = await Announcement.getUnreadCount(userId, {
      $or: [
        { type: "academy" },
        userBatch ? { type: "batch", targetBatch: userBatch } : null,
        userClasses.length > 0
          ? { type: "class", targetClass: { $in: userClasses } }
          : null,
      ].filter(Boolean),
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error getting unread announcements count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting unread announcements count",
      error: error.message,
    });
  }
});

// @desc    Get read status for an announcement (who has read it)
// @route   GET /api/announcements/:id/read-status
// @access  Private (Admin & Teacher only)
router.get(
  "/:id/read-status",
  protect,
  authorize("admin", "teacher"),
  async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id).populate({
        path: "readBy.userId",
        select: "email role",
        populate: {
          path: "userDetails",
          select: "firstName lastName fullName profileImageUrl",
        },
      });

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: "Announcement not found",
        });
      }

      // Transform the read status data for frontend
      const readStatus = announcement.readBy.map((read) => ({
        _id: read.userId._id,
        name:
          read.userId.userDetails?.fullName ||
          `${read.userId.userDetails?.firstName} ${read.userId.userDetails?.lastName}` ||
          read.userId.email,
        email: read.userId.email,
        role: read.userId.role,
        profileImage: imageURL(read.userId.userDetails?.profileImageUrl),
        readAt: read.readAt,
      }));

      res.json({
        success: true,
        data: readStatus,
      });
    } catch (error) {
      console.error("Error getting announcement read status:", error);
      res.status(500).json({
        success: false,
        message: "Error getting announcement read status",
        error: error.message,
      });
    }
  }
);

export default router;
