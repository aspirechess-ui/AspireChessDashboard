import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email_change", "password_reset"],
      required: true,
    },
    newEmail: {
      type: String,
      lowercase: true,
      // Only required for email_change type
      required: function () {
        return this.type === "email_change";
      },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        // Expires in 15 minutes
        return new Date(Date.now() + 15 * 60 * 1000);
      },
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5, // Maximum 5 attempts
    },
    lastAttemptAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic cleanup of expired codes
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
verificationCodeSchema.index({ userId: 1, type: 1 });
verificationCodeSchema.index({ email: 1, type: 1 });
verificationCodeSchema.index({ code: 1, type: 1 });

// Instance method to check if code is valid
verificationCodeSchema.methods.isValid = function () {
  return !this.isUsed && this.expiresAt > new Date() && this.attempts < 5;
};

// Instance method to increment attempts
verificationCodeSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  this.lastAttemptAt = new Date();
  return this.save();
};

// Instance method to mark as used
verificationCodeSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  return this.save();
};

// Static method to find valid code
verificationCodeSchema.statics.findValidCode = function (email, code, type) {
  return this.findOne({
    email: email.toLowerCase(),
    code,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });
};

// Static method to cleanup expired codes
verificationCodeSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true },
      { attempts: { $gte: 5 } },
    ],
  });
};

// Static method to invalidate existing codes
verificationCodeSchema.statics.invalidateExisting = function (userId, type) {
  return this.updateMany({ userId, type, isUsed: false }, { isUsed: true });
};

const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema
);

export default VerificationCode;
