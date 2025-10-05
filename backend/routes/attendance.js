import express from "express";
import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";
import Batch from "../models/Batch.js";
import { protect, authorize } from "../middleware/auth.js";


const router = express.Router();

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Private (Teacher only)
router.post("/", protect, authorize("teacher"), async (req, res) => {
  try {
    console.log("Creating attendance - Request body:", req.body);
    console.log("Creating attendance - User:", req.user._id);

    const { classId, batchId, sessionDate, sessionTime, attendanceRecords } =
      req.body;

    // Validate required fields
    if (
      !classId ||
      !batchId ||
      !sessionDate ||
      !sessionTime ||
      !attendanceRecords
    ) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: classId, batchId, sessionDate, sessionTime, attendanceRecords",
      });
    }

    // Verify class exists and teacher has access
    console.log("Looking for class:", classId, "for teacher:", req.user._id);
    const classItem = await Class.findOne({
      _id: classId,
      teacherId: req.user._id,
      isActive: true,
    });

    console.log("Found class:", classItem ? "Yes" : "No");
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found or access denied",
      });
    }

    // Check if attendance already exists for this class and date
    const existingAttendance = await Attendance.findOne({
      classId,
      sessionDate: new Date(sessionDate),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance already exists for this class and date. Use update instead.",
      });
    }

    // Validate student IDs belong to the class
    const enrolledStudentIds = classItem.enrolledStudents.map((id) =>
      id.toString()
    );
    for (const record of attendanceRecords) {
      if (!enrolledStudentIds.includes(record.studentId.toString())) {
        return res.status(400).json({
          success: false,
          message: `Student ${record.studentId} is not enrolled in this class`,
        });
      }
    }

    // Create attendance record
    console.log("Creating attendance record with data:", {
      classId,
      teacherId: req.user._id,
      batchId,
      sessionDate: new Date(sessionDate),
      sessionTime,
      attendanceRecords: attendanceRecords.length + " records",
      markedBy: req.user._id,
      status: "final",
    });

    const attendance = new Attendance({
      classId,
      teacherId: req.user._id,
      batchId,
      sessionDate: new Date(sessionDate),
      sessionTime,
      attendanceRecords,
      markedBy: req.user._id,
      status: "draft", // Mark as draft when created
    });

    await attendance.save();
    console.log("Attendance record saved successfully:", attendance._id);

    // Populate the response
    await attendance.populate("classId", "className");
    await attendance.populate("batchId", "batchName academicYear");
    await attendance.populate("teacherId", "email");
    await attendance.populate("attendanceRecords.studentId", "email");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error creating attendance record",
      error: error.message,
    });
  }
});

// @desc    Get attendance records for a class
// @route   GET /api/attendance/class/:classId
// @access  Private (Teacher only)
router.get(
  "/class/:classId",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      console.log("Fetching attendance for class:", req.params.classId);
      console.log("Query params:", req.query);
      console.log("Teacher ID:", req.user._id);

      const { classId } = req.params;
      const { startDate, endDate, page = 1, limit = 10 } = req.query;

      // Verify class exists and teacher has access
      const classItem = await Class.findOne({
        _id: classId,
        teacherId: req.user._id,
        isActive: true,
      });

      console.log("Class found:", classItem ? "Yes" : "No");
      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or access denied",
        });
      }

      // Build query
      const query = { classId };

      // Add date range filter if provided
      if (startDate || endDate) {
        query.sessionDate = {};
        if (startDate) query.sessionDate.$gte = new Date(startDate);
        if (endDate) query.sessionDate.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get attendance records
      console.log("Attendance query:", query);
      const attendanceRecords = await Attendance.find(query)
        .populate("classId", "className")
        .populate("batchId", "batchName academicYear")
        .populate("teacherId", "email")
        .populate("attendanceRecords.studentId", "email")
        .sort({ sessionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalRecords = await Attendance.countDocuments(query);

      console.log("Found attendance records:", attendanceRecords.length);
      console.log("Total records:", totalRecords);

      // Get student details for each attendance record
      const attendanceWithDetails = await Promise.all(
        attendanceRecords.map(async (attendance) => {
          const attendanceObj = attendance.toJSON();

          if (
            attendanceObj.attendanceRecords &&
            attendanceObj.attendanceRecords.length > 0
          ) {
            const studentIds = attendanceObj.attendanceRecords.map(
              (record) => record.studentId._id
            );
            const userDetails = await UserDetails.find({
              userId: { $in: studentIds },
            }).select("userId firstName lastName profileImageUrl");

            attendanceObj.attendanceRecords =
              attendanceObj.attendanceRecords.map((record) => {
                const details = userDetails.find(
                  (detail) =>
                    detail.userId.toString() === record.studentId._id.toString()
                );
                return {
                  ...record,
                  studentId: {
                    ...record.studentId,
                    userDetails: details
                      ? {
                          firstName: details.firstName,
                          lastName: details.lastName,
                          profileImageUrl: details.profileImageUrl,
                        }
                      : null,
                  },
                };
              });

            // Calculate attendance counts
            attendanceObj.totalStudents =
              attendanceObj.attendanceRecords.length;
            attendanceObj.presentCount = attendanceObj.attendanceRecords.filter(
              (record) => record.status === "present"
            ).length;
            attendanceObj.absentCount = attendanceObj.attendanceRecords.filter(
              (record) => record.status === "absent"
            ).length;
            attendanceObj.lateCount = attendanceObj.attendanceRecords.filter(
              (record) => record.status === "late"
            ).length;
            attendanceObj.excusedCount = attendanceObj.attendanceRecords.filter(
              (record) => record.status === "excused"
            ).length;
          }

          return attendanceObj;
        })
      );

      res.json({
        success: true,
        data: {
          attendanceRecords: attendanceWithDetails,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalRecords / parseInt(limit)),
            totalRecords,
            recordsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance records",
        error: error.message,
      });
    }
  }
);

// @desc    Get specific attendance record
// @route   GET /api/attendance/:id
// @access  Private (Teacher only)
router.get("/:id", protect, authorize("teacher"), async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    })
      .populate("classId", "className")
      .populate("batchId", "batchName academicYear")
      .populate("teacherId", "email")
      .populate("attendanceRecords.studentId", "email");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found or access denied",
      });
    }

    // Get student details
    const attendanceObj = attendance.toJSON();
    if (
      attendanceObj.attendanceRecords &&
      attendanceObj.attendanceRecords.length > 0
    ) {
      const studentIds = attendanceObj.attendanceRecords.map(
        (record) => record.studentId._id
      );
      const userDetails = await UserDetails.find({
        userId: { $in: studentIds },
      }).select("userId firstName lastName profileImageUrl");

      attendanceObj.attendanceRecords = attendanceObj.attendanceRecords.map(
        (record) => {
          const details = userDetails.find(
            (detail) =>
              detail.userId.toString() === record.studentId._id.toString()
          );
          return {
            ...record,
            studentId: {
              ...record.studentId,
              userDetails: details
                ? {
                    firstName: details.firstName,
                    lastName: details.lastName,
                    profileImageUrl: details.profileImageUrl,
                  }
                : null,
            },
          };
        }
      );

      // Calculate attendance counts
      attendanceObj.totalStudents = attendanceObj.attendanceRecords.length;
      attendanceObj.presentCount = attendanceObj.attendanceRecords.filter(
        (record) => record.status === "present"
      ).length;
      attendanceObj.absentCount = attendanceObj.attendanceRecords.filter(
        (record) => record.status === "absent"
      ).length;
      attendanceObj.lateCount = attendanceObj.attendanceRecords.filter(
        (record) => record.status === "late"
      ).length;
      attendanceObj.excusedCount = attendanceObj.attendanceRecords.filter(
        (record) => record.status === "excused"
      ).length;
    }

    res.json({
      success: true,
      data: attendanceObj,
    });
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance record",
      error: error.message,
    });
  }
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Teacher only)
router.put("/:id", protect, authorize("teacher"), async (req, res) => {
  try {
    const { sessionDate, sessionTime, attendanceRecords, status } = req.body;

    const attendance = await Attendance.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found or access denied",
      });
    }

    // Verify class still exists and teacher has access
    const classItem = await Class.findOne({
      _id: attendance.classId,
      teacherId: req.user._id,
      isActive: true,
    });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Associated class not found or access denied",
      });
    }

    // Validate student IDs if updating attendance records
    if (attendanceRecords) {
      const enrolledStudentIds = classItem.enrolledStudents.map((id) =>
        id.toString()
      );
      for (const record of attendanceRecords) {
        if (!enrolledStudentIds.includes(record.studentId.toString())) {
          return res.status(400).json({
            success: false,
            message: `Student ${record.studentId} is not enrolled in this class`,
          });
        }
      }
    }

    // Update fields
    if (sessionDate) attendance.sessionDate = new Date(sessionDate);
    if (sessionTime) attendance.sessionTime = sessionTime;
    if (attendanceRecords) attendance.attendanceRecords = attendanceRecords;
    if (status) attendance.status = status;

    // Update last modified timestamp and user
    attendance.lastUpdatedAt = new Date();

    await attendance.save();

    // Populate the response
    await attendance.populate("classId", "className");
    await attendance.populate("batchId", "batchName academicYear");
    await attendance.populate("teacherId", "email");
    await attendance.populate("attendanceRecords.studentId", "email");

    res.json({
      success: true,
      message: "Attendance record updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(500).json({
      success: false,
      message: "Error updating attendance record",
      error: error.message,
    });
  }
});

// @desc    Get attendance by date for a class
// @route   GET /api/attendance/class/:classId/date/:date
// @access  Private (Teacher only)
router.get(
  "/class/:classId/date/:date",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { classId, date } = req.params;

      // Verify class exists and teacher has access
      const classItem = await Class.findOne({
        _id: classId,
        teacherId: req.user._id,
        isActive: true,
      });

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or access denied",
        });
      }

      // Find attendance for the specific date
      const attendance = await Attendance.findOne({
        classId,
        sessionDate: new Date(date),
      })
        .populate("classId", "className")
        .populate("batchId", "batchName academicYear")
        .populate("teacherId", "email")
        .populate("attendanceRecords.studentId", "email");

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: "No attendance record found for this date",
        });
      }

      // Get student details
      const attendanceObj = attendance.toJSON();
      if (
        attendanceObj.attendanceRecords &&
        attendanceObj.attendanceRecords.length > 0
      ) {
        const studentIds = attendanceObj.attendanceRecords.map(
          (record) => record.studentId._id
        );
        const userDetails = await UserDetails.find({
          userId: { $in: studentIds },
        }).select("userId firstName lastName profileImageUrl");

        attendanceObj.attendanceRecords = attendanceObj.attendanceRecords.map(
          (record) => {
            const details = userDetails.find(
              (detail) =>
                detail.userId.toString() === record.studentId._id.toString()
            );
            return {
              ...record,
              studentId: {
                ...record.studentId,
                userDetails: details
                  ? {
                      firstName: details.firstName,
                      lastName: details.lastName,
                      profileImageUrl: details.profileImageUrl,
                    }
                  : null,
              },
            };
          }
        );

        // Calculate attendance counts
        attendanceObj.totalStudents = attendanceObj.attendanceRecords.length;
        attendanceObj.presentCount = attendanceObj.attendanceRecords.filter(
          (record) => record.status === "present"
        ).length;
        attendanceObj.absentCount = attendanceObj.attendanceRecords.filter(
          (record) => record.status === "absent"
        ).length;
        attendanceObj.lateCount = attendanceObj.attendanceRecords.filter(
          (record) => record.status === "late"
        ).length;
        attendanceObj.excusedCount = attendanceObj.attendanceRecords.filter(
          (record) => record.status === "excused"
        ).length;
      }

      res.json({
        success: true,
        data: attendanceObj,
      });
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance record",
        error: error.message,
      });
    }
  }
);

// @desc    Submit attendance (change status from draft to final)
// @route   PATCH /api/attendance/:id/submit
// @access  Private (Teacher only)
router.patch("/:id/submit", protect, authorize("teacher"), async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found or access denied",
      });
    }

    // Check if already submitted
    if (attendance.status === "final") {
      return res.status(400).json({
        success: false,
        message: "Attendance record is already submitted",
      });
    }

    // Update status to final
    attendance.status = "final";
    attendance.lastUpdatedAt = new Date();

    await attendance.save();

    // Populate the response
    await attendance.populate("classId", "className");
    await attendance.populate("batchId", "batchName academicYear");
    await attendance.populate("teacherId", "email");
    await attendance.populate("attendanceRecords.studentId", "email");

    res.json({
      success: true,
      message: "Attendance submitted successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error submitting attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting attendance record",
      error: error.message,
    });
  }
});

// @desc    Get attendance statistics for a class
// @route   GET /api/attendance/stats/:classId
// @access  Private (Teacher only)
router.get(
  "/stats/:classId",
  protect,
  authorize("teacher"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { startDate, endDate } = req.query;

      console.log("Fetching attendance stats for class:", classId);
      console.log("Date range:", { startDate, endDate });

      // Verify class exists and teacher has access
      const classItem = await Class.findOne({
        _id: classId,
        teacherId: req.user._id,
        isActive: true,
      });

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or access denied",
        });
      }

      // Build query for attendance records
      const query = { classId };

      // Add date range filter if provided
      if (startDate || endDate) {
        query.sessionDate = {};
        if (startDate) query.sessionDate.$gte = new Date(startDate);
        if (endDate) query.sessionDate.$lte = new Date(endDate);
      }

      // Get all attendance records for the class
      const attendanceRecords = await Attendance.find(query).sort({
        sessionDate: -1,
      });

      console.log("Found attendance records:", attendanceRecords.length);

      // Calculate statistics
      let totalSessions = attendanceRecords.length;
      let totalStudents = classItem.enrolledStudents.length;
      let totalPresentCount = 0;
      let totalAbsentCount = 0;
      let totalLateCount = 0;
      let totalExcusedCount = 0;
      let totalAttendanceSlots = 0;

      // Process each attendance record
      attendanceRecords.forEach((record) => {
        if (record.attendanceRecords && record.attendanceRecords.length > 0) {
          totalAttendanceSlots += record.attendanceRecords.length;

          record.attendanceRecords.forEach((attendance) => {
            switch (attendance.status) {
              case "present":
                totalPresentCount++;
                break;
              case "absent":
                totalAbsentCount++;
                break;
              case "late":
                totalLateCount++;
                break;
              case "excused":
                totalExcusedCount++;
                break;
            }
          });
        }
      });

      // Calculate average attendance percentage
      let averageAttendance = 0;
      if (totalAttendanceSlots > 0) {
        averageAttendance =
          ((totalPresentCount + totalLateCount) / totalAttendanceSlots) * 100;
      }

      const stats = {
        totalSessions,
        totalStudents,
        averageAttendance: Math.round(averageAttendance * 100) / 100, // Round to 2 decimal places
        presentCount: totalPresentCount,
        absentCount: totalAbsentCount,
        lateCount: totalLateCount,
        excusedCount: totalExcusedCount,
        totalAttendanceSlots,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      };

      console.log("Calculated stats:", stats);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance statistics",
        error: error.message,
      });
    }
  }
);

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Teacher only)
router.delete("/:id", protect, authorize("teacher"), async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found or access denied",
      });
    }

    // Allow deletion of both draft and final records
    // Note: Final records can now be deleted as per updated requirements
    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting attendance record",
      error: error.message,
    });
  }
});

// Student Attendance Routes

// @desc    Get attendance records for a student in a specific class
// @route   GET /api/attendance/student/class/:classId
// @access  Private (Student only)
router.get(
  "/student/class/:classId",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { startDate, endDate, page = 1, limit = 50 } = req.query;
      const studentId = req.user._id;

      console.log("Fetching student attendance for class:", classId);
      console.log("Student ID:", studentId);
      console.log("Date range:", { startDate, endDate });

      // Verify student is enrolled in the class
      const classItem = await Class.findOne({
        _id: classId,
        enrolledStudents: studentId,
        isActive: true,
      });

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or you are not enrolled in this class",
        });
      }

      // Build query
      const query = { classId };

      // Add date range filter if provided
      if (startDate || endDate) {
        query.sessionDate = {};
        if (startDate) query.sessionDate.$gte = new Date(startDate);
        if (endDate) query.sessionDate.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get attendance records for the class
      const attendanceRecords = await Attendance.find(query)
        .populate("classId", "className")
        .populate("batchId", "batchName academicYear")
        .populate("teacherId", "email")
        .sort({ sessionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      console.log("Found attendance records:", attendanceRecords.length);

      // Filter to only include student's attendance and format the response
      const studentAttendanceRecords = attendanceRecords
        .map((attendance) => {
          const studentRecord = attendance.attendanceRecords.find(
            (record) => record.studentId.toString() === studentId.toString()
          );

          if (!studentRecord) return null;

          return {
            _id: attendance._id,
            classId: attendance.classId,
            batchId: attendance.batchId,
            sessionDate: attendance.sessionDate,
            sessionTime: attendance.sessionTime,
            status: studentRecord.status,
            notes: studentRecord.notes || "",
            markedAt: studentRecord.markedAt,
            createdAt: attendance.createdAt,
            totalStudents: attendance.totalStudents,
            presentCount: attendance.presentCount,
            absentCount: attendance.absentCount,
            lateCount: attendance.lateCount,
            excusedCount: attendance.excusedCount,
          };
        })
        .filter(Boolean);

      // Get total count for pagination
      const totalRecords = await Attendance.countDocuments(query);
      const totalStudentRecords = await Attendance.aggregate([
        { $match: query },
        { $unwind: "$attendanceRecords" },
        { $match: { "attendanceRecords.studentId": studentId } },
        { $count: "total" },
      ]);

      const totalCount = totalStudentRecords[0]?.total || 0;

      console.log(
        "Student attendance records:",
        studentAttendanceRecords.length
      );
      console.log("Total student records:", totalCount);

      res.json({
        success: true,
        data: {
          attendanceRecords: studentAttendanceRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalRecords: totalCount,
            recordsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance records",
        error: error.message,
      });
    }
  }
);

// @desc    Get attendance statistics for a student in a specific class
// @route   GET /api/attendance/student/stats/:classId
// @access  Private (Student only)
router.get(
  "/student/stats/:classId",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { startDate, endDate } = req.query;
      const studentId = req.user._id;

      console.log("Fetching student attendance stats for class:", classId);
      console.log("Student ID:", studentId);
      console.log("Date range:", { startDate, endDate });

      // Verify student is enrolled in the class
      const classItem = await Class.findOne({
        _id: classId,
        enrolledStudents: studentId,
        isActive: true,
      });

      if (!classItem) {
        return res.status(404).json({
          success: false,
          message: "Class not found or you are not enrolled in this class",
        });
      }

      // Build query for attendance records
      const query = { classId };

      // Add date range filter if provided
      if (startDate || endDate) {
        query.sessionDate = {};
        if (startDate) query.sessionDate.$gte = new Date(startDate);
        if (endDate) query.sessionDate.$lte = new Date(endDate);
      }

      // Get all attendance records for the class
      const attendanceRecords = await Attendance.find(query).sort({
        sessionDate: -1,
      });

      console.log("Found total attendance records:", attendanceRecords.length);

      // Calculate student-specific statistics
      let totalSessions = 0;
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      // Process each attendance record to find student's records
      attendanceRecords.forEach((record) => {
        const studentRecord = record.attendanceRecords.find(
          (attendance) =>
            attendance.studentId.toString() === studentId.toString()
        );

        if (studentRecord) {
          totalSessions++;
          switch (studentRecord.status) {
            case "present":
              presentCount++;
              break;
            case "absent":
              absentCount++;
              break;
            case "late":
              lateCount++;
              break;
            case "excused":
              excusedCount++;
              break;
          }
        }
      });

      // Calculate attendance percentage
      let attendancePercentage = 0;
      if (totalSessions > 0) {
        attendancePercentage =
          ((presentCount + lateCount) / totalSessions) * 100;
      }

      const stats = {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100, // Round to 2 decimal places
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        className: classItem.className,
        batchName: classItem.linkedBatch
          ? classItem.linkedBatch.batchName
          : null,
      };

      console.log("Calculated student stats:", stats);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching student attendance statistics:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance statistics",
        error: error.message,
      });
    }
  }
);

export default router;
