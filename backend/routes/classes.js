import express from "express";
import Class from "../models/Class.js";
import Batch from "../models/Batch.js";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import Attendance from "../models/Attendance.js";
import ClassJoinRequest from "../models/ClassJoinRequest.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all classes for teacher
// @route   GET /api/classes/teacher
// @access  Private (Teacher only)
router.get("/teacher", protect, authorize("teacher"), async (req, res) => {
  try {
    const classes = await Class.find({
      teacherId: req.user._id,
      // Remove isActive filter - teachers should see all their classes
    })
      .populate("linkedBatch", "batchName academicYear")
      .populate("teacherId", "email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching classes",
      error: error.message,
    });
  }
});

// @desc    Get classes by batch for teacher
// @route   GET /api/classes/batch/:batchId
// @access  Private (Teacher only)
router.get(
  "/batch/:batchId",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { batchId } = req.params;

      // Validate batchId format
      if (!batchId || !batchId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batch ID format",
        });
      }

      // Verify batch exists
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      // Get classes for this batch created by this teacher
      const classes = await Class.find({
        linkedBatch: batchId,
        teacherId: req.user._id,
        // Remove isActive filter - teachers should see all their classes
      })
        .populate("linkedBatch", "batchName academicYear")
        .populate("teacherId", "email")
        .populate({
          path: "enrolledStudents",
          select: "email assignedBatch createdAt role",
          populate: {
            path: "assignedBatch",
            select: "batchName",
          },
        })
        .sort({ createdAt: -1 });

      // Get student details for enrolled students
      const classesWithDetails = await Promise.all(
        classes.map(async (classItem) => {
          const classObj = classItem.toJSON();

          // Ensure currentEnrolledStudents is up to date
          classObj.currentEnrolledStudents = classObj.enrolledStudents
            ? classObj.enrolledStudents.length
            : 0;

          if (
            classObj.enrolledStudents &&
            classObj.enrolledStudents.length > 0
          ) {
            const studentIds = classObj.enrolledStudents.map(
              (student) => student._id
            );
            const userDetails = await UserDetails.find({
              userId: { $in: studentIds },
            });

            classObj.enrolledStudents = classObj.enrolledStudents.map(
              (student) => {
                const details = userDetails.find(
                  (detail) =>
                    detail.userId.toString() === student._id.toString()
                );

                return {
                  ...student,
                  userDetails: details || null,
                };
              }
            );
          }
          return classObj;
        })
      );

      res.json({
        success: true,
        data: {
          batch,
          classes: classesWithDetails,
        },
      });
    } catch (error) {
      console.error("Error fetching batch classes:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching batch classes",
        error: error.message,
      });
    }
  }
);

// @desc    Get class by name and batch
// @route   GET /api/classes/batch/:batchName/class/:className
// @access  Private (Teacher only)
router.get(
  "/batch/:batchName/class/:className",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { batchName, className } = req.params;

      // Decode URL-encoded parameters
      const decodedBatchName = decodeURIComponent(batchName);
      const decodedClassName = decodeURIComponent(className);

      // Find batch by name
      const batch = await Batch.findOne({
        batchName: decodedBatchName,
        isActive: true,
        deletionStatus: "active",
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      // Find class by name and batch
      const classItem = await Class.findOne({
        className: decodedClassName,
        linkedBatch: batch._id,
        teacherId: req.user._id,
        // Remove isActive filter - teachers should see all their classes
      })
        .populate("linkedBatch", "batchName academicYear")
        .populate("teacherId", "email")
        .populate({
          path: "enrolledStudents",
          select: "email assignedBatch createdAt role",
          populate: {
            path: "assignedBatch",
            select: "batchName",
          },
        });

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or access denied",
        });
      }

      // Get student details for enrolled students
      const classObj = classItem.toJSON();

      // Ensure currentEnrolledStudents is up to date
      classObj.currentEnrolledStudents = classObj.enrolledStudents
        ? classObj.enrolledStudents.length
        : 0;

      if (classObj.enrolledStudents && classObj.enrolledStudents.length > 0) {
        const studentIds = classObj.enrolledStudents.map(
          (student) => student._id
        );
        const userDetails = await UserDetails.find({
          userId: { $in: studentIds },
        });

        classObj.enrolledStudents = classObj.enrolledStudents.map((student) => {
          const details = userDetails.find(
            (detail) => detail.userId.toString() === student._id.toString()
          );

          return {
            ...student,
            userDetails: details || null,
          };
        });
      }

      res.json({
        success: true,
        data: classObj,
      });
    } catch (error) {
      console.error("Error fetching class by name:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching class",
        error: error.message,
      });
    }
  }
);

// @desc    Get student's joined classes
// @route   GET /api/classes/student/joined
// @access  Private (Student only)
router.get(
  "/student/joined",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const studentId = req.user._id;

      // Find all classes where the student is enrolled
      const joinedClasses = await Class.find({
        enrolledStudents: studentId,
        isActive: true,
      })
        .populate("linkedBatch", "batchName academicYear")
        .populate("teacherId", "email")
        .sort({ createdAt: -1 });

      // Add current enrollment counts
      const classesWithCounts = joinedClasses.map((classItem) => {
        const classObj = classItem.toJSON();
        classObj.currentEnrolledStudents = classObj.enrolledStudents
          ? classObj.enrolledStudents.length
          : 0;
        return classObj;
      });

      res.json({
        success: true,
        data: classesWithCounts,
      });
    } catch (error) {
      console.error("Error fetching student's joined classes:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching joined classes",
        error: error.message,
      });
    }
  }
);

// @desc    Get available classes for student (from their batch)
// @route   GET /api/classes/student/available
// @access  Private (Student only)
router.get(
  "/student/available",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const studentId = req.user._id;

      // Get student's assigned batch
      const student = await User.findById(studentId).select("assignedBatch");
      console.log("Student data:", student);

      if (!student || !student.assignedBatch) {
        return res.status(400).json({
          success: false,
          message: "Student is not assigned to any batch",
        });
      }

      console.log("Student's assigned batch:", student.assignedBatch);

      // Find all classes in the student's batch that are open or request-to-join
      // Exclude unlisted classes and classes the student is already enrolled in
      const availableClasses = await Class.find({
        linkedBatch: student.assignedBatch,
        isActive: true,
        visibility: { $in: ["open", "request_to_join"] },
        enrolledStudents: { $ne: studentId }, // Not already enrolled
      })
        .populate("linkedBatch", "batchName academicYear")
        .populate("teacherId", "email")
        .sort({ createdAt: -1 });

      console.log("Found available classes:", availableClasses.length);
      console.log(
        "Available classes details:",
        availableClasses.map((c) => ({
          className: c.className,
          visibility: c.visibility,
          linkedBatch: c.linkedBatch?._id,
          enrolledStudents: c.enrolledStudents.length,
        }))
      );

      // Add current enrollment counts
      const classesWithCounts = availableClasses.map((classItem) => {
        const classObj = classItem.toJSON();
        classObj.currentEnrolledStudents = classObj.enrolledStudents
          ? classObj.enrolledStudents.length
          : 0;
        return classObj;
      });

      res.json({
        success: true,
        data: classesWithCounts,
      });
    } catch (error) {
      console.error("Error fetching available classes:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching available classes",
        error: error.message,
      });
    }
  }
);

// @desc    Get single class details for student
// @route   GET /api/classes/student/:classId
// @access  Private (Student only - enrolled classes only)
router.get(
  "/student/:classId",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const studentId = req.user._id;
      const { classId } = req.params;

      // Find the class and verify the student is enrolled
      const classItem = await Class.findOne({
        _id: classId,
        enrolledStudents: studentId,
        isActive: true,
      })
        .populate("linkedBatch", "batchName academicYear")
        .populate("teacherId", "email")
        .populate({
          path: "enrolledStudents",
          select: "email assignedBatch",
          populate: {
            path: "assignedBatch",
            select: "batchName",
          },
        });

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or you are not enrolled in this class",
        });
      }

      // Get student details for enrolled students
      const classObj = classItem.toJSON();

      // Ensure currentEnrolledStudents is up to date
      classObj.currentEnrolledStudents = classObj.enrolledStudents
        ? classObj.enrolledStudents.length
        : 0;

      if (classObj.enrolledStudents && classObj.enrolledStudents.length > 0) {
        const studentIds = classObj.enrolledStudents.map(
          (student) => student._id
        );
        const userDetails = await UserDetails.find({
          userId: { $in: studentIds },
        });

        classObj.enrolledStudents = classObj.enrolledStudents.map((student) => {
          const details = userDetails.find(
            (detail) => detail.userId.toString() === student._id.toString()
          );

          return {
            ...student,
            userDetails: details || null,
          };
        });
      }

      res.json({
        success: true,
        data: classObj,
      });
    } catch (error) {
      console.error("Error fetching class details for student:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching class details",
        error: error.message,
      });
    }
  }
);

// @desc    Student leave class
// @route   DELETE /api/classes/student/:classId/leave
// @access  Private (Student only)
router.delete(
  "/student/:classId/leave",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const studentId = req.user._id;
      const { classId } = req.params;

      // Find the class and verify the student is enrolled
      const classData = await Class.findOne({
        _id: classId,
        enrolledStudents: studentId,
        isActive: true,
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found or you are not enrolled in this class",
        });
      }

      // Remove student from the class
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        {
          $pull: { enrolledStudents: studentId },
        },
        { new: true }
      );

      // Update currentEnrolledStudents count
      updatedClass.currentEnrolledStudents =
        updatedClass.enrolledStudents.length;
      await updatedClass.save();

      res.json({
        success: true,
        message: "Successfully left the class",
        data: {
          classId: classId,
          className: classData.className,
          remainingStudents: updatedClass.currentEnrolledStudents,
        },
      });
    } catch (error) {
      console.error("Error leaving class:", error);
      res.status(500).json({
        success: false,
        message: "Error leaving class",
        error: error.message,
      });
    }
  }
);

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private (Teacher only - own classes)
router.get("/:id", protect, authorize("teacher"), async (req, res) => {
  try {
    const classItem = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    })
      .populate("linkedBatch", "batchName academicYear")
      .populate("teacherId", "email")
      .populate({
        path: "enrolledStudents",
        select: "email assignedBatch",
        populate: {
          path: "assignedBatch",
          select: "batchName",
        },
      });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found or access denied",
      });
    }

    // Get student details for enrolled students
    const classObj = classItem.toJSON();

    // Ensure currentEnrolledStudents is up to date
    classObj.currentEnrolledStudents = classObj.enrolledStudents
      ? classObj.enrolledStudents.length
      : 0;

    if (classObj.enrolledStudents && classObj.enrolledStudents.length > 0) {
      const studentIds = classObj.enrolledStudents.map(
        (student) => student._id
      );
      const userDetails = await UserDetails.find({
        userId: { $in: studentIds },
      });

      classObj.enrolledStudents = classObj.enrolledStudents.map((student) => {
        const details = userDetails.find(
          (detail) => detail.userId.toString() === student._id.toString()
        );

        return {
          ...student,
          userDetails: details || null,
        };
      });
    }

    res.json({
      success: true,
      data: classObj,
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching class",
      error: error.message,
    });
  }
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Teacher only)
router.post("/", protect, authorize("teacher"), async (req, res) => {
  try {
    const {
      className,
      description,
      linkedBatch,
      visibility,
      maxStudents,
      hasStudentLimit,
    } = req.body;

    // Validate required fields
    if (!className || !linkedBatch) {
      return res.status(400).json({
        success: false,
        message: "Class name and linked batch are required",
      });
    }

    // Verify batch exists and is active
    const batch = await Batch.findOne({
      _id: linkedBatch,
      isActive: true,
      deletionStatus: "active",
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found or inactive",
      });
    }

    // Check if class name already exists for this batch
    const existingClass = await Class.findOne({
      className,
      linkedBatch,
      isActive: true,
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Class with this name already exists for the selected batch",
      });
    }

    // Create class
    const classData = {
      className,
      description,
      createdBy: req.user._id,
      teacherId: req.user._id,
      linkedBatch,
      batchName: batch.batchName,
      batchLocked: true, // Lock batch once linked
      visibility: visibility || "open",
    };

    // Handle student limit
    if (hasStudentLimit && maxStudents) {
      classData.maxStudents = maxStudents;
    }
    // If hasStudentLimit is false, don't set maxStudents (unlimited)

    const newClass = new Class(classData);
    await newClass.save();

    // Add class to batch's linkedClasses if the field exists
    if (batch.linkedClasses) {
      batch.linkedClasses.push(newClass._id);
      await batch.save();
    }

    // Populate the created class
    await newClass.populate("linkedBatch", "batchName academicYear");
    await newClass.populate("teacherId", "email");

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass.toJSON(),
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      success: false,
      message: "Error creating class",
      error: error.message,
    });
  }
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Teacher only - own classes)
router.put("/:id", protect, authorize("teacher"), async (req, res) => {
  try {
    const { className, description, visibility, maxStudents } = req.body;

    const classItem = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found or access denied",
      });
    }

    // Check if class name already exists for this batch (excluding current class)
    if (className) {
      const existingClass = await Class.findOne({
        className,
        linkedBatch: classItem.linkedBatch,
        isActive: true,
        _id: { $ne: req.params.id },
      });

      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: "Class with this name already exists for this batch",
        });
      }
    }

    // Update fields
    if (className) classItem.className = className;
    if (description !== undefined) classItem.description = description;
    if (visibility) classItem.visibility = visibility;
    if (maxStudents) classItem.maxStudents = maxStudents;
    if (req.body.isActive !== undefined) classItem.isActive = req.body.isActive;

    await classItem.save();
    await classItem.populate("linkedBatch", "batchName academicYear");
    await classItem.populate("teacherId", "email");

    res.json({
      success: true,
      message: "Class updated successfully",
      data: classItem.toJSON(),
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      success: false,
      message: "Error updating class",
      error: error.message,
    });
  }
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher only - own classes)
router.delete("/:id", protect, authorize("teacher"), async (req, res) => {
  try {
    const classItem = await Class.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found or access denied",
      });
    }

    // Delete all attendance records for this class
    await Attendance.deleteMany({ classId: classItem._id });

    // Delete all join requests for this class
    await ClassJoinRequest.deleteMany({ classId: classItem._id });

    // Remove from batch's linkedClasses
    const batch = await Batch.findById(classItem.linkedBatch);
    if (batch) {
      batch.linkedClasses = batch.linkedClasses.filter(
        (classId) => classId.toString() !== classItem._id.toString()
      );
      await batch.save();
    }

    // Actually delete the class (hard delete)
    await Class.findByIdAndDelete(classItem._id);

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting class",
      error: error.message,
    });
  }
});

// @desc    Get available students from the same batch for adding to class
// @route   GET /api/classes/:classId/available-students
// @access  Private (Teacher only)
router.get(
  "/:classId/available-students",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Get the class and verify teacher ownership
      const classData = await Class.findById(classId).populate("linkedBatch");
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      if (classData.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. Only the class teacher can view available students.",
        });
      }

      console.log("Looking for students in batch:", classData.linkedBatch._id);
      console.log("Excluding enrolled students:", classData.enrolledStudents);

      // Get all students from the same batch who are not already enrolled in this class
      // Using the User model's assignedBatch field
      const availableStudents = await User.find({
        role: "student",
        isActive: true,
        assignedBatch: classData.linkedBatch._id, // Students from the same batch
        _id: { $nin: classData.enrolledStudents }, // Exclude already enrolled students
      })
        .populate("userDetails")
        .populate("assignedBatch", "batchName academicYear");

      console.log("Found available students:", availableStudents.length);

      // Debug: Let's also check total students in this batch
      const totalStudentsInBatch = await User.countDocuments({
        role: "student",
        isActive: true,
        assignedBatch: classData.linkedBatch._id,
      });
      console.log("Total students in batch:", totalStudentsInBatch);

      res.json({
        success: true,
        message: "Available students retrieved successfully",
        data: {
          students: availableStudents,
          batchInfo: {
            batchName: classData.linkedBatch.batchName,
            academicYear: classData.linkedBatch.academicYear,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching available students:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching available students",
        error: error.message,
      });
    }
  }
);

// @desc    Add students to class
// @route   POST /api/classes/:classId/add-students
// @access  Private (Teacher only)
router.post(
  "/:classId/add-students",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { studentIds } = req.body;

      if (
        !studentIds ||
        !Array.isArray(studentIds) ||
        studentIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Student IDs are required and must be an array",
        });
      }

      // Get the class and verify teacher ownership
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      if (classData.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only the class teacher can add students.",
        });
      }

      // Check if class has reached maximum capacity
      const newEnrollmentCount =
        classData.currentEnrolledStudents + studentIds.length;
      if (classData.maxStudents && newEnrollmentCount > classData.maxStudents) {
        return res.status(400).json({
          success: false,
          message: `Cannot add students. Class capacity is ${classData.maxStudents}, current enrollment is ${classData.currentEnrolledStudents}`,
        });
      }

      // Verify all students exist and are from the same batch
      const students = await User.find({
        _id: { $in: studentIds },
        role: "student",
        isActive: true,
        assignedBatch: classData.linkedBatch, // Check if student is from the same batch
      }).populate("userDetails");

      if (students.length !== studentIds.length) {
        return res.status(400).json({
          success: false,
          message: "Some students are not valid or not from the same batch",
        });
      }

      // Add students to the class (using $addToSet to avoid duplicates)
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        {
          $addToSet: { enrolledStudents: { $each: studentIds } },
        },
        { new: true }
      );

      // Update currentEnrolledStudents count
      updatedClass.currentEnrolledStudents =
        updatedClass.enrolledStudents.length;
      await updatedClass.save();

      // Populate the class data
      await updatedClass.populate("enrolledStudents", "email");
      await updatedClass.populate({
        path: "enrolledStudents",
        populate: {
          path: "userDetails",
          select: "firstName lastName phoneNumber profileImageUrl",
        },
      });

      res.json({
        success: true,
        message: `Successfully added ${students.length} student(s) to the class`,
        data: updatedClass,
      });
    } catch (error) {
      console.error("Error adding students to class:", error);
      res.status(500).json({
        success: false,
        message: "Error adding students to class",
        error: error.message,
      });
    }
  }
);

// @desc    Remove student from class
// @route   DELETE /api/classes/:classId/students/:studentId
// @access  Private (Teacher only)
router.delete(
  "/:classId/students/:studentId",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { classId, studentId } = req.params;

      // Get the class and verify teacher ownership
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      if (classData.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only the class teacher can remove students.",
        });
      }

      // Check if student is enrolled in the class
      if (!classData.enrolledStudents.includes(studentId)) {
        return res.status(400).json({
          success: false,
          message: "Student is not enrolled in this class",
        });
      }

      // Remove student from the class
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        {
          $pull: { enrolledStudents: studentId },
        },
        { new: true }
      );

      // Update currentEnrolledStudents count
      updatedClass.currentEnrolledStudents =
        updatedClass.enrolledStudents.length;
      await updatedClass.save();

      // Populate the class data
      await updatedClass.populate("enrolledStudents", "email");
      await updatedClass.populate({
        path: "enrolledStudents",
        populate: {
          path: "userDetails",
          select: "firstName lastName phoneNumber profileImageUrl",
        },
      });

      res.json({
        success: true,
        message: "Student removed from class successfully",
        data: updatedClass,
      });
    } catch (error) {
      console.error("Error removing student from class:", error);
      res.status(500).json({
        success: false,
        message: "Error removing student from class",
        error: error.message,
      });
    }
  }
);

// @desc    Update class visibility for testing
// @route   PATCH /api/classes/:classId/visibility
// @access  Private (Teacher/Admin only)
router.patch(
  "/:classId/visibility",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { visibility } = req.body;

      if (!["open", "request_to_join", "unlisted"].includes(visibility)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid visibility value. Must be 'open', 'request_to_join', or 'unlisted'",
        });
      }

      const classItem = await Class.findByIdAndUpdate(
        classId,
        { visibility },
        { new: true }
      ).populate("linkedBatch", "batchName academicYear");

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      res.json({
        success: true,
        message: `Class visibility updated to ${visibility}`,
        data: classItem,
      });
    } catch (error) {
      console.error("Error updating class visibility:", error);
      res.status(500).json({
        success: false,
        message: "Error updating class visibility",
        error: error.message,
      });
    }
  }
);

export default router;
