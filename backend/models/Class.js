import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Single Batch Linking (Cannot be changed once set)
    linkedBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    batchName: {
      type: String, // For easy display
    },
    batchLocked: {
      type: Boolean,
      default: false, // True once batch is linked - prevents changes
    },

    // Visibility System
    visibility: {
      type: String,
      enum: ["open", "unlisted", "request_to_join"],
      default: "open",
    },

    maxStudents: {
      type: Number,
    },
    currentEnrolledStudents: {
      type: Number,
      default: 0,
    },

    // Simplified Student Management
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // All enrolled students regardless of how they joined

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
classSchema.index({ teacherId: 1 });
classSchema.index({ linkedBatch: 1 });
classSchema.index({ visibility: 1 });
classSchema.index({ isActive: 1 });

// Pre-save middleware to update currentEnrolledStudents
classSchema.pre("save", function (next) {
  this.currentEnrolledStudents = this.enrolledStudents.length;
  next();
});

// Virtual for getting batch information
classSchema.virtual("batch", {
  ref: "Batch",
  localField: "linkedBatch",
  foreignField: "_id",
  justOne: true,
});

// Virtual for getting teacher information
classSchema.virtual("teacher", {
  ref: "User",
  localField: "teacherId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtual fields are serialized
classSchema.set("toJSON", { virtuals: true });
classSchema.set("toObject", { virtuals: true });

const Class = mongoose.model("Class", classSchema);

export default Class;
