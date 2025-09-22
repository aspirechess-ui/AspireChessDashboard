import mongoose from "mongoose";

const classJoinRequestSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestMessage: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Teacher who approved/rejected
    },
    reviewedAt: {
      type: Date,
    },
    reviewMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
classJoinRequestSchema.index({ classId: 1, status: 1 });
classJoinRequestSchema.index({ studentId: 1, status: 1 });
classJoinRequestSchema.index({ classId: 1, studentId: 1, status: 1 });
classJoinRequestSchema.index({ createdAt: 1 });

// Virtual for getting class information
classJoinRequestSchema.virtual("class", {
  ref: "Class",
  localField: "classId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for getting student information
classJoinRequestSchema.virtual("student", {
  ref: "User",
  localField: "studentId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for getting reviewer information
classJoinRequestSchema.virtual("reviewer", {
  ref: "User",
  localField: "reviewedBy",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtual fields are serialized
classJoinRequestSchema.set("toJSON", { virtuals: true });
classJoinRequestSchema.set("toObject", { virtuals: true });

const ClassJoinRequest = mongoose.model(
  "ClassJoinRequest",
  classJoinRequestSchema
);

export default ClassJoinRequest;
