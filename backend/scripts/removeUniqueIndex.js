import mongoose from "mongoose";
import ClassJoinRequest from "../models/ClassJoinRequest.js";

const removeUniqueIndex = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/chess-academy";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the collection
    const collection = mongoose.connection.db.collection("classjoinrequests");

    // Check existing indexes
    console.log("Current indexes:");
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}:`, index);
    });

    // Try to drop the unique index
    try {
      await collection.dropIndex("classId_1_studentId_1");
      console.log(
        "✅ Successfully dropped unique index: classId_1_studentId_1"
      );
    } catch (error) {
      if (error.code === 27) {
        console.log(
          "ℹ️  Index classId_1_studentId_1 does not exist (already removed)"
        );
      } else {
        console.error("❌ Error dropping index:", error.message);
      }
    }

    // Check indexes after removal
    console.log("\nIndexes after removal:");
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach((index, i) => {
      console.log(`${i + 1}:`, index);
    });

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the migration
removeUniqueIndex();
