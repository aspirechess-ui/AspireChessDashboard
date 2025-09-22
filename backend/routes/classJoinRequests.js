import express from "express";
import ClassJoinRequest from "../models/ClassJoinRequest.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get pending requests for a class (Teacher only)
router.get(
  "/class/:classId/pending",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { classId } = req.params;

      // Verify the class exists and user has permission
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check if user is the teacher of this class or admin
      if (
        req.user.role !== "admin" &&
        classDoc.teacherId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not authorized to view requests for this class.",
        });
      }

      const requests = await ClassJoinRequest.find({
        classId,
        status: "pending",
      })
        .populate({
          path: "studentId",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName profileImageUrl phoneNumber",
          },
        })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending requests",
      });
    }
  }
);

// Bulk approve join requests (Teacher only)
router.patch(
  "/bulk/approve",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { requestIds, reviewMessage } = req.body;
      const reviewerId = req.user._id;

      if (
        !requestIds ||
        !Array.isArray(requestIds) ||
        requestIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Request IDs are required",
        });
      }

      // Find all requests and verify they belong to the same class
      const requests = await ClassJoinRequest.find({
        _id: { $in: requestIds },
        status: "pending",
      })
        .populate("classId")
        .populate({
          path: "studentId",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName",
          },
        });

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No valid pending requests found",
        });
      }

      // Verify all requests belong to the same class
      const classId = requests[0].classId._id;
      const invalidRequests = requests.filter(
        (req) => req.classId._id.toString() !== classId.toString()
      );

      if (invalidRequests.length > 0) {
        return res.status(400).json({
          success: false,
          message: "All requests must belong to the same class",
        });
      }

      // Check if user has permission to approve requests for this class
      const classDoc = requests[0].classId;
      if (
        req.user.role !== "admin" &&
        classDoc.teacherId.toString() !== reviewerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not authorized to approve requests for this class.",
        });
      }

      // Check class capacity upfront
      const currentEnrolled = classDoc.enrolledStudents.length;
      const maxStudents = classDoc.maxStudents;
      const availableSpots = maxStudents
        ? maxStudents - currentEnrolled
        : Infinity;

      // Count valid requests (excluding already enrolled students)
      const validRequests = requests.filter((request) => {
        return !classDoc.enrolledStudents.some(
          (student) => student.toString() === request.studentId._id.toString()
        );
      });

      // If there are more valid requests than available spots, reject all with error
      if (maxStudents && validRequests.length > availableSpots) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve ${validRequests.length} requests. Class has only ${availableSpots} available spot(s) out of ${maxStudents} maximum capacity.`,
          data: {
            requestedCount: validRequests.length,
            availableSpots,
            maxStudents,
            currentEnrolled,
          },
        });
      }

      let approved = [];
      let rejected = [];
      let alreadyEnrolled = [];

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];

        // Check if student is already enrolled
        const isEnrolled = classDoc.enrolledStudents.some(
          (student) => student.toString() === request.studentId._id.toString()
        );

        if (isEnrolled) {
          alreadyEnrolled.push({
            requestId: request._id,
            studentName:
              `${request.studentId.userDetails?.firstName || ""} ${
                request.studentId.userDetails?.lastName || ""
              }`.trim() || request.studentId.email,
          });
          continue;
        }

        // All remaining requests can be approved since we checked capacity upfront
        approved.push(request);
      }

      // Process approved requests
      for (const request of approved) {
        request.status = "approved";
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.reviewMessage = reviewMessage?.trim() || "";
        await request.save();

        // Auto-reject other pending requests for this student-class combination
        await ClassJoinRequest.updateMany(
          {
            classId: request.classId._id,
            studentId: request.studentId._id,
            status: "pending",
            _id: { $ne: request._id },
          },
          {
            $set: {
              status: "rejected",
              reviewedBy: reviewerId,
              reviewedAt: new Date(),
              reviewMessage: "Auto-rejected: Another request was approved",
            },
          }
        );

        // Add student to the class
        await Class.findByIdAndUpdate(request.classId._id, {
          $push: { enrolledStudents: request.studentId._id },
          $inc: { currentEnrolledStudents: 1 },
        });
      }

      // Mark already enrolled students' requests as rejected
      for (const enrolledInfo of alreadyEnrolled) {
        await ClassJoinRequest.findByIdAndUpdate(enrolledInfo.requestId, {
          status: "rejected",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewMessage: "Student is already enrolled in this class",
        });
      }

      res.json({
        success: true,
        message: `Bulk operation completed: ${approved.length} approved${
          alreadyEnrolled.length > 0
            ? `, ${alreadyEnrolled.length} already enrolled`
            : ""
        }`,
        data: {
          approved: approved.length,
          rejected: 0, // No partial rejections anymore
          alreadyEnrolled: alreadyEnrolled.length,
          capacity: {
            current: currentEnrolled + approved.length,
            max: maxStudents,
            available: maxStudents
              ? maxStudents - (currentEnrolled + approved.length)
              : "Unlimited",
          },
          details: {
            approvedStudents: approved.map((req) => ({
              requestId: req._id,
              studentName:
                `${req.studentId.userDetails?.firstName || ""} ${
                  req.studentId.userDetails?.lastName || ""
                }`.trim() || req.studentId.email,
            })),
            rejectedStudents: [], // No partial rejections anymore
            alreadyEnrolledStudents: alreadyEnrolled,
          },
        },
      });
    } catch (error) {
      console.error("Error bulk approving requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk approve requests",
      });
    }
  }
);

// Bulk reject join requests (Teacher only)
router.patch(
  "/bulk/reject",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { requestIds, reviewMessage } = req.body;
      const reviewerId = req.user._id;

      if (
        !requestIds ||
        !Array.isArray(requestIds) ||
        requestIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Request IDs are required",
        });
      }

      if (!reviewMessage || !reviewMessage.trim()) {
        return res.status(400).json({
          success: false,
          message: "Review message is required for rejection",
        });
      }

      // Find all requests and verify they belong to the same class
      const requests = await ClassJoinRequest.find({
        _id: { $in: requestIds },
        status: "pending",
      })
        .populate("classId")
        .populate({
          path: "studentId",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName",
          },
        });

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No valid pending requests found",
        });
      }

      // Verify all requests belong to the same class
      const classId = requests[0].classId._id;
      const invalidRequests = requests.filter(
        (req) => req.classId._id.toString() !== classId.toString()
      );

      if (invalidRequests.length > 0) {
        return res.status(400).json({
          success: false,
          message: "All requests must belong to the same class",
        });
      }

      // Check if user has permission to reject requests for this class
      const classDoc = requests[0].classId;
      if (
        req.user.role !== "admin" &&
        classDoc.teacherId.toString() !== reviewerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not authorized to reject requests for this class.",
        });
      }

      // Process all rejections
      const rejectedRequests = [];
      for (const request of requests) {
        request.status = "rejected";
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.reviewMessage = reviewMessage.trim();
        await request.save();

        rejectedRequests.push({
          requestId: request._id,
          studentName:
            `${request.studentId.userDetails?.firstName || ""} ${
              request.studentId.userDetails?.lastName || ""
            }`.trim() || request.studentId.email,
        });
      }

      res.json({
        success: true,
        message: `${rejectedRequests.length} request(s) rejected successfully`,
        data: {
          rejected: rejectedRequests.length,
          details: {
            rejectedStudents: rejectedRequests,
          },
        },
      });
    } catch (error) {
      console.error("Error bulk rejecting requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk reject requests",
      });
    }
  }
);

// Get all requests for a class (Teacher only)
router.get(
  "/class/:classId",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      // Verify the class exists and user has permission
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check if user is the teacher of this class or admin
      if (
        req.user.role !== "admin" &&
        classDoc.teacherId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not authorized to view requests for this class.",
        });
      }

      const query = { classId };
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const requests = await ClassJoinRequest.find(query)
        .populate({
          path: "studentId",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName profileImageUrl phoneNumber",
          },
        })
        .populate({
          path: "reviewedBy",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ClassJoinRequest.countDocuments(query);

      res.json({
        success: true,
        data: requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching class requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch class requests",
      });
    }
  }
);

// Create a join request (Student only)
router.post("/", protect, authorize("student"), async (req, res) => {
  try {
    const { classId, requestMessage } = req.body;
    const studentId = req.user._id;

    // Verify the class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if student is already enrolled
    const isEnrolled = classDoc.enrolledStudents.some(
      (student) => student.toString() === studentId.toString()
    );
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this class",
      });
    }

    // Check if student has any approved request for this class
    const approvedRequest = await ClassJoinRequest.findOne({
      classId,
      studentId,
      status: "approved",
    });
    if (approvedRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an approved request for this class",
      });
    }

    // Handle open classes - direct join with capacity check
    if (classDoc.visibility === "open") {
      // Check class capacity for open classes
      if (
        classDoc.maxStudents &&
        classDoc.enrolledStudents.length >= classDoc.maxStudents
      ) {
        return res.status(400).json({
          success: false,
          message: "Class has reached maximum capacity and is now full",
        });
      }

      // For open classes, directly add student to class without creating a request
      await Class.findByIdAndUpdate(classId, {
        $push: { enrolledStudents: studentId },
        $inc: { currentEnrolledStudents: 1 },
      });

      // Create an auto-approved request record for history
      const joinRequest = new ClassJoinRequest({
        classId,
        studentId,
        requestMessage: requestMessage?.trim() || "Direct join to open class",
        status: "approved",
        reviewedBy: null, // System auto-approval
        reviewedAt: new Date(),
        reviewMessage: "Auto-approved: Open class direct join",
      });

      await joinRequest.save();

      // Populate the request for response
      await joinRequest.populate({
        path: "studentId",
        select: "email",
        populate: {
          path: "userDetails",
          select: "firstName lastName profileImageUrl",
        },
      });
      await joinRequest.populate("classId", "className");

      return res.status(201).json({
        success: true,
        message: "Successfully joined the open class",
        data: joinRequest,
      });
    }

    // Check if class allows join requests (for request_to_join visibility)
    if (classDoc.visibility !== "request_to_join") {
      return res.status(400).json({
        success: false,
        message: "This class does not accept join requests",
      });
    }

    // For request_to_join classes, check if capacity is full
    if (
      classDoc.maxStudents &&
      classDoc.enrolledStudents.length >= classDoc.maxStudents
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class has reached maximum capacity. No new requests can be accepted.",
      });
    }

    // Check for recent requests (10 minutes timeout)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRequest = await ClassJoinRequest.findOne({
      classId,
      studentId,
      createdAt: { $gte: tenMinutesAgo },
    }).sort({ createdAt: -1 });

    if (recentRequest) {
      const timeLeft = Math.ceil(
        (recentRequest.createdAt.getTime() + 10 * 60 * 1000 - Date.now()) /
          1000 /
          60
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} minute${
          timeLeft !== 1 ? "s" : ""
        } before sending another request`,
        timeLeft: timeLeft,
      });
    }

    // Create the join request for request_to_join classes
    const joinRequest = new ClassJoinRequest({
      classId,
      studentId,
      requestMessage: requestMessage?.trim() || "",
    });

    await joinRequest.save();

    // Populate the request for response
    await joinRequest.populate({
      path: "studentId",
      select: "email",
      populate: {
        path: "userDetails",
        select: "firstName lastName profileImageUrl",
      },
    });
    await joinRequest.populate("classId", "className");

    res.status(201).json({
      success: true,
      message: "Join request submitted successfully",
      data: joinRequest,
    });
  } catch (error) {
    console.error("Error creating join request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit join request",
    });
  }
});

// Approve a join request (Teacher only)
router.patch(
  "/:requestId/approve",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { reviewMessage } = req.body;
      const reviewerId = req.user._id;

      const joinRequest = await ClassJoinRequest.findById(requestId)
        .populate("classId")
        .populate({
          path: "studentId",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName",
          },
        });

      if (!joinRequest) {
        return res.status(404).json({
          success: false,
          message: "Join request not found",
        });
      }

      if (joinRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This request has already been processed",
        });
      }

      // Check if user has permission to approve this request
      if (
        req.user.role !== "admin" &&
        joinRequest.classId.teacherId.toString() !== reviewerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not authorized to approve requests for this class.",
        });
      }

      // Check if student is already enrolled
      const isEnrolled = joinRequest.classId.enrolledStudents.some(
        (student) => student.toString() === joinRequest.studentId._id.toString()
      );
      if (isEnrolled) {
        return res.status(400).json({
          success: false,
          message: "Student is already enrolled in this class",
        });
      }

      // Check class capacity
      if (
        joinRequest.classId.maxStudents &&
        joinRequest.classId.enrolledStudents.length >=
          joinRequest.classId.maxStudents
      ) {
        return res.status(400).json({
          success: false,
          message: "Class has reached maximum capacity",
        });
      }

      // Update the approved request
      joinRequest.status = "approved";
      joinRequest.reviewedBy = reviewerId;
      joinRequest.reviewedAt = new Date();
      joinRequest.reviewMessage = reviewMessage?.trim() || "";
      await joinRequest.save();

      // Auto-reject all other pending requests for this student-class combination
      await ClassJoinRequest.updateMany(
        {
          classId: joinRequest.classId._id,
          studentId: joinRequest.studentId._id,
          status: "pending",
          _id: { $ne: requestId }, // Exclude the approved request
        },
        {
          $set: {
            status: "rejected",
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            reviewMessage: "Auto-rejected: Another request was approved",
          },
        }
      );

      // Add student to the class
      await Class.findByIdAndUpdate(joinRequest.classId._id, {
        $push: { enrolledStudents: joinRequest.studentId._id },
        $inc: { currentEnrolledStudents: 1 },
      });

      res.json({
        success: true,
        message: "Join request approved successfully",
        data: joinRequest,
      });
    } catch (error) {
      console.error("Error approving join request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve join request",
      });
    }
  }
);

// Reject a join request (Teacher only)
router.patch(
  "/:requestId/reject",
  protect,
  authorize("teacher", "admin"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { reviewMessage } = req.body;
      const reviewerId = req.user._id;

      const joinRequest = await ClassJoinRequest.findById(requestId)
        .populate("classId")
        .populate({
          path: "studentId",
          select: "email",
          populate: {
            path: "userDetails",
            select: "firstName lastName",
          },
        });

      if (!joinRequest) {
        return res.status(404).json({
          success: false,
          message: "Join request not found",
        });
      }

      if (joinRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This request has already been processed",
        });
      }

      // Check if user has permission to reject this request
      if (
        req.user.role !== "admin" &&
        joinRequest.classId.teacherId.toString() !== reviewerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not authorized to reject requests for this class.",
        });
      }

      // Update the join request
      joinRequest.status = "rejected";
      joinRequest.reviewedBy = reviewerId;
      joinRequest.reviewedAt = new Date();
      joinRequest.reviewMessage = reviewMessage?.trim() || "";
      await joinRequest.save();

      res.json({
        success: true,
        message: "Join request rejected successfully",
        data: joinRequest,
      });
    } catch (error) {
      console.error("Error rejecting join request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject join request",
      });
    }
  }
);

// Get student's own requests
router.get("/my-requests", protect, authorize("student"), async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { studentId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const requests = await ClassJoinRequest.find(query)
      .populate("classId", "className description visibility")
      .populate({
        path: "reviewedBy",
        select: "email",
        populate: {
          path: "userDetails",
          select: "firstName lastName",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ClassJoinRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your requests",
    });
  }
});

// Cancel a pending request (Student only)
router.delete(
  "/:requestId",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const studentId = req.user._id;

      const joinRequest = await ClassJoinRequest.findOne({
        _id: requestId,
        studentId,
        status: "pending",
      });

      if (!joinRequest) {
        return res.status(404).json({
          success: false,
          message: "Pending join request not found",
        });
      }

      await ClassJoinRequest.findByIdAndDelete(requestId);

      res.json({
        success: true,
        message: "Join request cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling join request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel join request",
      });
    }
  }
);

// Check if student can send a request (Student only)
router.get(
  "/can-request/:classId",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const studentId = req.user._id;

      // Verify the class exists
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check class capacity first (for both open and request_to_join classes)
      if (
        classDoc.maxStudents &&
        classDoc.enrolledStudents.length >= classDoc.maxStudents
      ) {
        return res.json({
          success: true,
          canRequest: false,
          reason: "Class has reached maximum capacity and is now full",
        });
      }

      // Check if class allows join requests or is open
      if (!["open", "request_to_join"].includes(classDoc.visibility)) {
        return res.json({
          success: true,
          canRequest: false,
          reason: "This class does not accept join requests",
        });
      }

      // Check if student is already enrolled
      const isEnrolled = classDoc.enrolledStudents.some(
        (student) => student.toString() === studentId.toString()
      );
      if (isEnrolled) {
        return res.json({
          success: true,
          canRequest: false,
          reason: "You are already enrolled in this class",
        });
      }

      // Check if student has any approved request for this class
      const approvedRequest = await ClassJoinRequest.findOne({
        classId,
        studentId,
        status: "approved",
      });
      if (approvedRequest) {
        return res.json({
          success: true,
          canRequest: false,
          reason: "You already have an approved request for this class",
        });
      }

      // For open classes, students can join directly (no request needed)
      if (classDoc.visibility === "open") {
        return res.json({
          success: true,
          canRequest: true,
          isOpenClass: true,
          message: "You can join this open class directly",
        });
      }

      // For request_to_join classes, check for recent requests (10 minutes timeout)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentRequest = await ClassJoinRequest.findOne({
        classId,
        studentId,
        createdAt: { $gte: tenMinutesAgo },
      }).sort({ createdAt: -1 });

      if (recentRequest) {
        const timeLeft = Math.ceil(
          (recentRequest.createdAt.getTime() + 10 * 60 * 1000 - Date.now()) /
            1000 /
            60
        );
        return res.json({
          success: true,
          canRequest: false,
          reason: `Please wait ${timeLeft} minute${
            timeLeft !== 1 ? "s" : ""
          } before sending another request`,
          timeLeft: timeLeft,
        });
      }

      // Get pending requests count for this student-class combination
      const pendingRequestsCount = await ClassJoinRequest.countDocuments({
        classId,
        studentId,
        status: "pending",
      });

      res.json({
        success: true,
        canRequest: true,
        pendingRequestsCount,
        message: "You can send a request to join this class",
      });
    } catch (error) {
      console.error("Error checking request eligibility:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check request eligibility",
      });
    }
  }
);

export default router;
