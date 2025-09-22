import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    fullName: {
      type: String,
      trim: true,
    },

    // Contact Information
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
    },
    alternatePhoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },

    // Profile Image
    profileImagePath: String,
    profileImageUrl: String,

    // Role-specific Information
    // For Students
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.userRole === "student";
      },
    },
    parentName: {
      type: String,
      trim: true,
      required: function () {
        return this.userRole === "student";
      },
      maxlength: [100, "Parent name cannot exceed 100 characters"],
    },
    parentPhoneNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.userRole === "student";
      },
      match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phoneNumber: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"],
      },
    },

    // For Teachers
    qualification: {
      type: String,
      trim: true,
      required: function () {
        return this.userRole === "teacher";
      },
      maxlength: [200, "Qualification cannot exceed 200 characters"],
    },
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      required: function () {
        return this.userRole === "teacher";
      },
    },
    specialization: {
      type: String,
      trim: true,
      required: function () {
        return this.userRole === "teacher";
      },
      maxlength: [100, "Specialization cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    // For Admins
    designation: {
      type: String,
      trim: true,
      required: function () {
        return this.userRole === "admin";
      },
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters"],
    },

    // Additional Information
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: [50, "Nationality cannot exceed 50 characters"],
    },

    // System Fields
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    lastProfileUpdate: Date,
    userRole: String, // Cached from User model for validation
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to set fullName and userRole
userDetailsSchema.pre("save", async function (next) {
  // Set full name
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  // Get user role for validation
  if (!this.userRole && this.userId) {
    const User = mongoose.model("User");
    const user = await User.findById(this.userId);
    if (user) {
      this.userRole = user.role;
    }
  }

  // Update last profile update timestamp
  this.lastProfileUpdate = new Date();

  next();
});

// Method to check profile completion
userDetailsSchema.methods.checkProfileCompletion = function () {
  const requiredFields = {
    common: ["firstName", "lastName", "phoneNumber"],
    student: ["dateOfBirth", "parentName", "parentPhoneNumber"],
    teacher: ["qualification", "experience", "specialization"],
    admin: ["designation"],
  };

  const required = [
    ...requiredFields.common,
    ...(requiredFields[this.userRole] || []),
  ];
  const completed = required.every((field) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      return (
        this[parent] &&
        this[parent][child] &&
        this[parent][child].toString().trim() !== ""
      );
    }
    return this[field] && this[field].toString().trim() !== "";
  });

  this.isProfileComplete = completed;
  return {
    isComplete: completed,
    missingFields: required.filter((field) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return (
          !this[parent] ||
          !this[parent][child] ||
          this[parent][child].toString().trim() === ""
        );
      }
      return !this[field] || this[field].toString().trim() === "";
    }),
  };
};

// Index for faster queries (userId already has unique: true, so no need for separate index)
userDetailsSchema.index({ fullName: "text" });

export default mongoose.model("UserDetails", userDetailsSchema);
