import mongoose from "mongoose";
import crypto from "crypto";

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      maxlength: [100, "Batch name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hasStudentLimit: {
      type: Boolean,
      default: false,
    },
    maxStudents: {
      type: Number,
      min: [1, "Maximum students must be at least 1"],
      max: [1000, "Maximum students cannot exceed 1000"],
      validate: {
        validator: function (value) {
          // Only validate if hasStudentLimit is true
          if (this.hasStudentLimit) {
            return value && value >= 1;
          }
          // If hasStudentLimit is false, maxStudents can be undefined/null
          return true;
        },
        message: "Maximum students is required when student limit is enabled",
      },
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, "Current students cannot be negative"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },

    // Integrated Signup Code
    signupCode: {
      type: String,
      unique: true,
      required: true,
    },
    signupCodeResetCount: {
      type: Number,
      default: 0,
    },
    lastSignupCodeReset: Date,

    // Enhanced Deletion Tracking
    deletionStatus: {
      type: String,
      enum: ["active", "draft_deletion", "permanently_deleted"],
      default: "active",
    },
    markedForDeletionAt: Date,
    markedForDeletionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    permanentlyDeletedAt: Date,
    permanentlyDeletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletionReason: {
      type: String,
      trim: true,
      maxlength: [200, "Deletion reason cannot exceed 200 characters"],
    },

    // Student Management
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    linkedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique signup code
batchSchema.methods.generateSignupCode = function () {
  // Generate 8-character alphanumeric code
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  this.signupCode = code;
  return code;
};

// Pre-save middleware to generate signup code if not exists and sync currentStudents
batchSchema.pre("save", async function (next) {
  console.log("Pre-save middleware called, signupCode:", this.signupCode);

  // Sync currentStudents with enrolledStudents array length
  this.currentStudents = this.enrolledStudents.length;

  if (!this.signupCode) {
    console.log("No signup code found, generating new one...");
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      this.generateSignupCode();
      console.log(`Attempt ${attempts + 1}: Generated code ${this.signupCode}`);

      try {
        // Check if this signup code already exists
        const existingBatch = await this.constructor.findOne({
          signupCode: this.signupCode,
          _id: { $ne: this._id }, // Exclude current document if updating
        });

        if (!existingBatch) {
          isUnique = true;
          console.log("Unique signup code generated:", this.signupCode);
        } else {
          console.log("Code already exists, trying again...");
        }
      } catch (error) {
        console.error("Error checking signup code uniqueness:", error);
      }

      attempts++;
    }

    if (!isUnique) {
      console.error(
        "Failed to generate unique signup code after",
        maxAttempts,
        "attempts"
      );
      return next(
        new Error(
          "Unable to generate unique signup code after multiple attempts"
        )
      );
    }
  } else {
    console.log("Signup code already exists:", this.signupCode);
  }

  console.log(
    "Pre-save middleware completed, final signupCode:",
    this.signupCode
  );
  next();
});

// Method to reset signup code
batchSchema.methods.resetSignupCode = function () {
  this.generateSignupCode();
  this.signupCodeResetCount += 1;
  this.lastSignupCodeReset = new Date();
  return this.signupCode;
};

// Method to check if batch can accept more students
batchSchema.methods.canAcceptStudents = function () {
  const hasSpaceAvailable = this.hasStudentLimit
    ? this.currentStudents < this.maxStudents
    : true; // No limit if hasStudentLimit is false

  return hasSpaceAvailable && this.isActive && this.deletionStatus === "active";
};

// Method to add student to batch
batchSchema.methods.addStudent = function (studentId) {
  if (!this.canAcceptStudents()) {
    const errorMsg = this.hasStudentLimit
      ? "Batch has reached maximum student limit"
      : "Batch cannot accept more students";
    throw new Error(errorMsg);
  }

  if (!this.enrolledStudents.includes(studentId)) {
    this.enrolledStudents.push(studentId);
    // currentStudents will be updated by pre-save middleware
  }
};

// Method to remove student from batch
batchSchema.methods.removeStudent = function (studentId) {
  const index = this.enrolledStudents.indexOf(studentId);
  if (index > -1) {
    this.enrolledStudents.splice(index, 1);
    console.log(
      `Student ${studentId} removed from batch ${this.batchName} (${this._id})`
    );
    console.log(`Enrolled students count: ${this.enrolledStudents.length}`);
    // currentStudents will be updated by pre-save middleware
    return true; // Student was removed
  } else {
    console.log(
      `Student ${studentId} was not found in batch ${this.batchName} (${this._id})`
    );
    return false; // Student was not in the batch
  }
};

// Virtual for available spots
batchSchema.virtual("availableSpots").get(function () {
  if (!this.hasStudentLimit) {
    return "Unlimited";
  }
  return this.maxStudents - this.currentStudents;
});

// Virtual for occupancy percentage
batchSchema.virtual("occupancyPercentage").get(function () {
  if (!this.hasStudentLimit) {
    return 0; // No percentage if unlimited
  }
  return Math.round((this.currentStudents / this.maxStudents) * 100);
});

// Static method to remove student from all batches
// Note: In this system, each student can only be in one batch (enrolled via unique signup code)
// but this method handles the general case for robustness and future-proofing
batchSchema.statics.removeStudentFromAllBatches = async function (studentId) {
  try {
    console.log(`Removing student ${studentId} from batches...`);

    // Find all batches that have this student enrolled
    // In normal operation, this should return 0 or 1 batch since students can only join one batch
    const batchesWithStudent = await this.find({
      enrolledStudents: studentId,
      deletionStatus: "active",
    });

    console.log(
      `Found ${batchesWithStudent.length} batches with student ${studentId}`
    );

    // Log if student is in multiple batches (shouldn't happen in normal operation)
    if (batchesWithStudent.length > 1) {
      console.warn(
        `⚠️  Student ${studentId} found in ${batchesWithStudent.length} batches. Expected: 0 or 1 batch.`
      );
    }

    let removedCount = 0;

    // Remove student from each batch
    for (const batch of batchesWithStudent) {
      const wasRemoved = batch.removeStudent(studentId);
      if (wasRemoved) {
        await batch.save();
        removedCount++;
        console.log(
          `✅ Student removed from batch: ${batch.batchName} (ID: ${batch._id})`
        );
      }
    }

    console.log(
      `Student ${studentId} successfully removed from ${removedCount} batch(es)`
    );
    return {
      success: true,
      batchesUpdated: removedCount,
      expectedCount:
        batchesWithStudent.length <= 1
          ? batchesWithStudent.length
          : `${batchesWithStudent.length} (unexpected)`,
    };
  } catch (error) {
    console.error(`Error removing student ${studentId} from batches:`, error);
    throw error;
  }
};

// Indexes for better performance
batchSchema.index({ signupCode: 1 });
batchSchema.index({ createdBy: 1 });
batchSchema.index({ deletionStatus: 1 });
batchSchema.index({ isActive: 1 });
batchSchema.index({ academicYear: 1 });
batchSchema.index({ enrolledStudents: 1 }); // Add index for enrolled students

// Ensure virtuals are included in JSON
batchSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Batch", batchSchema);
