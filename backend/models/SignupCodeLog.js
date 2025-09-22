import mongoose from "mongoose";

const signupCodeLogSchema = new mongoose.Schema(
  {
    signupCode: {
      type: String,
      required: true,
      index: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    registrationStatus: {
      type: String,
      enum: ["successful", "failed", "pending"],
      default: "successful",
    },
    failureReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
signupCodeLogSchema.index({ batchId: 1, usedAt: -1 });
signupCodeLogSchema.index({ signupCode: 1, usedAt: -1 });
signupCodeLogSchema.index({ userId: 1 });

// Static method to log signup code usage
signupCodeLogSchema.statics.logUsage = async function (
  signupCode,
  batchId,
  userId,
  userEmail,
  userName,
  ipAddress = null,
  userAgent = null,
  registrationStatus = "successful",
  failureReason = null
) {
  return await this.create({
    signupCode,
    batchId,
    userId,
    userEmail,
    userName,
    ipAddress,
    userAgent,
    registrationStatus,
    failureReason,
  });
};

// Static method to get usage statistics for a batch
signupCodeLogSchema.statics.getBatchUsageStats = async function (batchId) {
  const stats = await this.aggregate([
    { $match: { batchId: new mongoose.Types.ObjectId(batchId) } },
    {
      $group: {
        _id: "$registrationStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Static method to get recent usage logs for a batch
signupCodeLogSchema.statics.getRecentUsage = async function (
  batchId,
  limit = 10
) {
  return await this.find({ batchId })
    .populate("userId", "email")
    .sort({ usedAt: -1 })
    .limit(limit);
};

export default mongoose.model("SignupCodeLog", signupCodeLogSchema);
