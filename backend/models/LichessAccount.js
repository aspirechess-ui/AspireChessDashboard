import mongoose from "mongoose";

const lichessAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One Lichess account per user
    },
    lichessUsername: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
    // Lichess account data
    accountData: {
      // Profile information
      profile: {
        username: String,
        title: String,
        patron: Boolean,
        online: Boolean,
        playing: Boolean,
        url: String,
        createdAt: Date,
        seenAt: Date,
      },
      // Current ratings
      perfs: {
        ultraBullet: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
        bullet: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
        blitz: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
        rapid: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
        classical: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
        correspondence: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
        puzzle: {
          rating: Number,
          rd: Number,
          prog: Number,
          games: Number,
        },
      },
      // Activity stats
      count: {
        all: Number,
        rated: Number,
        ai: Number,
        draw: Number,
        drawH: Number,
        loss: Number,
        lossH: Number,
        win: Number,
        winH: Number,
        bookmark: Number,
        playing: Number,
        import: Number,
        me: Number,
      },
      // Additional stats
      stats: {
        totalPlayTime: Number, // in seconds
        currentStreak: Number,
        maxStreak: Number,
        winRate: Number,
        recentGamesCount: Number, // games in last 30 days
        averageOpponentRating: Number,
      },
      // Time control preferences
      timeControls: {
        bullet: {
          totalTime: Number, // in seconds
          gamesPlayed: Number,
          winRate: Number
        },
        blitz: {
          totalTime: Number,
          gamesPlayed: Number, 
          winRate: Number
        },
        rapid: {
          totalTime: Number,
          gamesPlayed: Number,
          winRate: Number
        },
        classical: {
          totalTime: Number,
          gamesPlayed: Number,
          winRate: Number
        }
      },
      // Advanced statistics
      advanced: {
        averageGameLength: Number, // in moves
        resignationRate: Number, // percentage of games resigned
        timeoutRate: Number, // percentage of games lost on time
        checkmates: Number, // games won by checkmate
        stalemates: Number, // games drawn by stalemate
        endgameStats: {
          queenEndgames: Number,
          rookEndgames: Number,
          bishopEndgames: Number,
          knightEndgames: Number,
          pawnEndgames: Number
        },
        tacticalStats: {
          puzzlesSolved: Number,
          puzzleRating: Number,
          tacticalThemes: [{
            theme: String, // e.g., "Pin", "Fork", "Skewer"
            accuracy: Number
          }]
        }
      }
    },
    // Sync information
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
    syncStatus: {
      type: String,
      enum: ["success", "error", "pending"],
      default: "success",
    },
    syncError: {
      type: String,
      default: null,
    },
    // Connection history
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient querying
lichessAccountSchema.index({ userId: 1 });
lichessAccountSchema.index({ lichessUsername: 1 });
lichessAccountSchema.index({ isConnected: 1 });

// Virtual for user details
lichessAccountSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Instance methods
lichessAccountSchema.methods.updateAccountData = function(lichessData) {
  this.accountData = lichessData;
  this.lastSyncAt = new Date();
  this.syncStatus = "success";
  this.syncError = null;
  return this.save();
};

lichessAccountSchema.methods.setSyncError = function(error) {
  this.syncStatus = "error";
  this.syncError = error;
  this.lastSyncAt = new Date();
  return this.save();
};

lichessAccountSchema.methods.reconnect = function(newUsername) {
  this.isConnected = true;
  this.lichessUsername = newUsername.toLowerCase();
  this.connectedAt = new Date();
  this.syncStatus = "pending";
  return this.save();
};

// Static methods
lichessAccountSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId, isConnected: true });
};

lichessAccountSchema.statics.findAllConnected = function() {
  return this.find({ 
    isConnected: true
  }).populate("userId", "email role");
};

lichessAccountSchema.statics.getTeacherOverview = function() {
  return this.aggregate([
    {
      $match: { 
        isConnected: true
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $lookup: {
        from: "userdetails",
        localField: "userId",
        foreignField: "userId",
        as: "userDetails"
      }
    },
    {
      $unwind: { 
        path: "$userDetails", 
        preserveNullAndEmptyArrays: true 
      }
    },
    {
      $project: {
        lichessUsername: 1,
        lastSyncAt: 1,
        accountData: 1,
        user: {
          _id: 1,
          email: 1,
          role: 1
        },
        userDetails: {
          firstName: 1,
          lastName: 1,
          profileImageUrl: 1
        }
      }
    }
  ]);
};

const LichessAccount = mongoose.model("LichessAccount", lichessAccountSchema);

export default LichessAccount;