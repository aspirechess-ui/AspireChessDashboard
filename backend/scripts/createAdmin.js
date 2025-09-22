import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/chess-academy"
    );
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("❌ Admin user already exists!");
      console.log(`📧 Email: ${existingAdmin.email}`);
      process.exit(1);
    }

    // Admin details
    const adminData = {
      email: "admin@chessacademy.com",
      password: "admin123", // This will be hashed
      firstName: "Chess",
      lastName: "Admin",
      phoneNumber: "+1234567890",
      designation: "System Administrator",
      department: "Administration",
    };

    console.log("🔐 Creating admin user...");

    // Create admin user
    const adminUser = new User({
      email: adminData.email,
      password: adminData.password, // Will be hashed by the pre-save middleware
      role: "admin",
      isActive: true,
      accountCreationType: "admin_created",
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");

    // Create admin user details
    const adminDetails = new UserDetails({
      userId: adminUser._id,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      fullName: `${adminData.firstName} ${adminData.lastName}`,
      phoneNumber: adminData.phoneNumber,
      designation: adminData.designation,
      department: adminData.department,
      isProfileComplete: true,
    });

    await adminDetails.save();
    console.log("✅ Admin user details created successfully");

    console.log("\n🎉 Admin account created successfully!");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);
    console.log("⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the script
createAdmin();
