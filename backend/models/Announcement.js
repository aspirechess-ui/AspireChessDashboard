import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ["academy", "batch", "class"],
      required: true,
    },
    // For batch announcements
    targetBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: function () {
        return this.type === "batch";
      },
    },
    // For class announcements
    targetClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: function () {
        return this.type === "class";
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Tracking for notification purposes
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
announcementSchema.index({ type: 1, isActive: 1 });
announcementSchema.index({ targetBatch: 1, isActive: 1 });
announcementSchema.index({ targetClass: 1, isActive: 1 });
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ createdAt: -1 });

// Virtual for checking if user has read the announcement
announcementSchema.virtual("isReadByUser").get(function () {
  return this.readBy && this.readBy.length > 0;
});

// Method to mark as read by user
announcementSchema.methods.markAsReadBy = function (userId) {
  const existingRead = this.readBy.find(
    (read) => read.userId.toString() === userId.toString()
  );

  if (!existingRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }

  return this.save();
};

// Method to get unread count for user
announcementSchema.statics.getUnreadCount = function (userId, filters = {}) {
  const query = {
    isActive: true,
    "readBy.userId": { $ne: userId },
    ...filters,
  };

  return this.countDocuments(query);
};

// Static method to get announcements for a user based on their role and access
announcementSchema.statics.getAnnouncementsForUser = function (
  userId,
  userRole,
  userBatch = null,
  userClasses = []
) {
  const conditions = [];

  // Academy announcements - visible to all
  conditions.push({ type: "academy" });

  // Batch announcements - visible to users in the batch
  if (userBatch) {
    conditions.push({
      type: "batch",
      targetBatch: userBatch,
    });
  }

  // Class announcements - visible to users in the classes
  if (userClasses && userClasses.length > 0) {
    conditions.push({
      type: "class",
      targetClass: { $in: userClasses },
    });
  }

  return this.find({
    isActive: true,
    $or: conditions,
  })
    .populate({
      path: "createdBy",
      select: "email role",
      populate: {
        path: "userDetails",
        select: "firstName lastName fullName",
      },
    })
    .populate("targetBatch", "batchName academicYear")
    .populate("targetClass", "className description")
    .sort({ createdAt: -1 });
};

announcementSchema.set("toJSON", { virtuals: true });
announcementSchema.set("toObject", { virtuals: true });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
