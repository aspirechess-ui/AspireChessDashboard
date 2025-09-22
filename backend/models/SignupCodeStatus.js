import mongoose from "mongoose";

const signupCodeStatusSchema = new mongoose.Schema(
  {
    signupCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    activatedAt: {
      type: Date,
      default: Date.now,
    },
    deactivatedAt: {
      type: Date,
    },
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deactivationReason: {
      type: String,
      trim: true,
      maxlength: [200, "Deactivation reason cannot exceed 200 characters"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },
    maxUsage: {
      type: Number,
      default: null, // null means unlimited
      min: [1, "Max usage must be at least 1"],
    },
    expiresAt: {
      type: Date,
      default: null, // null means no expiration
    },
    statusHistory: [
      {
        action: {
          type: String,
          enum: ["activated", "deactivated", "reset"],
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        performedAt: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          trim: true,
        },
        oldSignupCode: {
          type: String, // For reset actions
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to activate signup code
signupCodeStatusSchema.methods.activate = function (userId, reason = null) {
  this.isActive = true;
  this.activatedAt = new Date();
  this.activatedBy = userId;
  this.deactivatedAt = null;
  this.deactivatedBy = null;
  this.deactivationReason = null;

  this.statusHistory.push({
    action: "activated",
    performedBy: userId,
    reason: reason,
  });
};

// Method to deactivate signup code
signupCodeStatusSchema.methods.deactivate = function (userId, reason = null) {
  this.isActive = false;
  this.deactivatedAt = new Date();
  this.deactivatedBy = userId;
  this.deactivationReason = reason;

  this.statusHistory.push({
    action: "deactivated",
    performedBy: userId,
    reason: reason,
  });
};

// Method to reset signup code
signupCodeStatusSchema.methods.reset = function (
  newSignupCode,
  userId,
  reason = null
) {
  const oldCode = this.signupCode;
  this.signupCode = newSignupCode;
  this.usageCount = 0;
  this.isActive = true;
  this.activatedAt = new Date();
  this.activatedBy = userId;
  this.deactivatedAt = null;
  this.deactivatedBy = null;
  this.deactivationReason = null;

  this.statusHistory.push({
    action: "reset",
    performedBy: userId,
    reason: reason,
    oldSignupCode: oldCode,
  });
};

// Method to increment usage count
signupCodeStatusSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
};

// Method to check if code can be used
signupCodeStatusSchema.methods.canBeUsed = function () {
  // Check if active
  if (!this.isActive) {
    return { canUse: false, reason: "Signup code is deactivated" };
  }

  // Check expiration
  if (this.expiresAt && new Date() > this.expiresAt) {
    return { canUse: false, reason: "Signup code has expired" };
  }

  // Check usage limit
  if (this.maxUsage && this.usageCount >= this.maxUsage) {
    return { canUse: false, reason: "Signup code usage limit reached" };
  }

  return { canUse: true };
};

// Virtual for remaining usage
signupCodeStatusSchema.virtual("remainingUsage").get(function () {
  if (!this.maxUsage) return null; // Unlimited
  return Math.max(0, this.maxUsage - this.usageCount);
});

// Virtual for usage percentage
signupCodeStatusSchema.virtual("usagePercentage").get(function () {
  if (!this.maxUsage) return 0; // Unlimited
  return Math.round((this.usageCount / this.maxUsage) * 100);
});

// Static method to create initial status for a batch
signupCodeStatusSchema.statics.createForBatch = async function (
  signupCode,
  batchId,
  createdBy
) {
  return await this.create({
    signupCode,
    batchId,
    activatedBy: createdBy,
    statusHistory: [
      {
        action: "activated",
        performedBy: createdBy,
        reason: "Initial creation",
      },
    ],
  });
};

// Indexes for better performance
signupCodeStatusSchema.index({ batchId: 1 });
signupCodeStatusSchema.index({ isActive: 1 });
signupCodeStatusSchema.index({ expiresAt: 1 });

// Ensure virtuals are included in JSON
signupCodeStatusSchema.set("toJSON", { virtuals: true });

export default mongoose.model("SignupCodeStatus", signupCodeStatusSchema);
