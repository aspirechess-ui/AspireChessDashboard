import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  sessionDate: {
    type: Date,
    required: true,
  },
  sessionTime: {
    type: String,
    required: true,
  },

  // Array-based attendance storage
  attendanceRecords: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["present", "absent", "late", "excused"],
        required: true,
      },
      notes: {
        type: String,
        default: "",
      },
      markedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Summary data
  totalStudents: {
    type: Number,
    default: 0,
  },
  presentCount: {
    type: Number,
    default: 0,
  },
  absentCount: {
    type: Number,
    default: 0,
  },
  lateCount: {
    type: Number,
    default: 0,
  },
  excusedCount: {
    type: Number,
    default: 0,
  },

  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  isFinalized: {
    type: Boolean,
    default: false,
  },

  // Additional status for draft/final
  status: {
    type: String,
    enum: ["draft", "final"],
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
attendanceSchema.index({ classId: 1, sessionDate: 1 });
attendanceSchema.index({ teacherId: 1, sessionDate: 1 });
attendanceSchema.index({ batchId: 1, sessionDate: 1 });

// Pre-save middleware to calculate summary data
attendanceSchema.pre("save", function (next) {
  // Calculate summary counts
  this.totalStudents = this.attendanceRecords.length;
  this.presentCount = this.attendanceRecords.filter(
    (record) => record.status === "present"
  ).length;
  this.absentCount = this.attendanceRecords.filter(
    (record) => record.status === "absent"
  ).length;
  this.lateCount = this.attendanceRecords.filter(
    (record) => record.status === "late"
  ).length;
  this.excusedCount = this.attendanceRecords.filter(
    (record) => record.status === "excused"
  ).length;

  // Update lastUpdatedAt
  this.lastUpdatedAt = new Date();

  // Set isFinalized when status changes to final
  if (this.status === "final") {
    this.isFinalized = true;
  }

  next();
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
