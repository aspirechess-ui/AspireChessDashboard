import VerificationCode from "../models/VerificationCode.js";

// Cleanup expired verification codes
export const cleanupExpiredCodes = async () => {
  try {
    const result = await VerificationCode.cleanupExpired();
    console.log(`Cleaned up ${result.deletedCount} expired verification codes`);
    return result;
  } catch (error) {
    console.error("Error cleaning up expired verification codes:", error);
    throw error;
  }
};

// Schedule cleanup to run every hour
export const scheduleCleanup = () => {
  // Run cleanup immediately
  cleanupExpiredCodes();

  // Then run every hour
  setInterval(cleanupExpiredCodes, 60 * 60 * 1000); // 1 hour

  console.log("Verification code cleanup scheduled to run every hour");
};

export default {
  cleanupExpiredCodes,
  scheduleCleanup,
};
