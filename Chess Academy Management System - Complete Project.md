# Chess Academy Management System - Complete Project Documentation

## Project Overview

A **MERN stack** (MongoDB, Express, React, Node.js) dashboard with **Chakra UI** for managing a chess academy. The system supports a **batch-centric organization** with **three user roles**, **class visibility options**, and can be exported as an **Android APK** using Capacitor without maintaining separate repositories.

## Core Features

- **Batch-based student management** with automatic account assignment
- **Role-based access control** (Admin, Teacher, Student)
- **Class visibility system** (Open, Unlisted, Request-to-Join)
- **Offline chess class management** with daily attendance tracking
- **Lichess username-based integration** with queued data fetching
- **Flexible signup code system** with batch-based validity
- **Single-batch class linking** system for organized learning
- **Three-tier announcement system** (Class, Batch, Academy)
- **Background queue system** to handle Lichess rate limits (1 request/minute)

## System Architecture

### **Technology Stack**

- **Frontend**: React with Chakra UI
- **Backend**: Node.js + Express API
- **Database**: MongoDB
- **Queue System**: Bull Queue with Redis for Lichess data fetching
- **Mobile**: Capacitor for APK export from same codebase
- **API Integration**: Scheduled background jobs for Lichess data sync

### **Mobile Export Strategy**

- Use **Capacitor** to wrap React app as Android APK
- **Single repository** for both web and mobile versions
- No separate mobile codebase maintenance required

## Role-Based System Structure

### **Admin Role**

**Primary Function**: System administration, user management, and full class control

**Permissions:**

- **Batch Management**: Create, manage, and track student batches with integrated signup codes
- **Account Creation**: Create teacher and admin accounts (EXCLUSIVE permission)
- **Full Class Management**: Create, edit, delete, and manage all classes (including teacher-created ones)
- **Class Visibility Control**: Set and modify class visibility options for any class
- **Student Enrollment**: Manually enroll/remove students from any class regardless of visibility settings
- **User Oversight**: Monitor all users, account creation methods, and system analytics
- **Announcements**: Post academy-wide, batch-specific, and class-specific announcements
- **Reports & Analytics**: Generate comprehensive system reports and batch performance analytics
- **Settings**: Configure system settings and academy information

**Restrictions:**

- **Cannot Mark Attendance**: Cannot mark student attendance (teacher-only function)

### **Teacher Role**

**Primary Function**: Class creation and management

**Permissions:**

- **Class Creation**: Full authority to create and manage their own classes
- **Single Batch Linking**: Link created classes to one admin-created batch (cannot change once set)
- **Class Visibility Settings**: Set visibility options (Open, Unlisted, Request-to-Join) for their classes
- **Student Management**:
  - For **Open** classes: View auto-enrolled students
  - For **Unlisted** classes: Manually add students from batch
  - For **Request-to-Join** classes: Approve/reject student join requests
- **Class Management**: Edit schedules, capacity, and details for their created classes
- **Attendance Management**: Mark and track daily/session-based attendance for their classes
- **Announcements**: Post class-specific, batch-specific, and academy-wide announcements
- **Student Performance**: View chess performance data of students in their classes
- **Teaching Schedule**: Manage their personal teaching timetable

**Restrictions:**

- **Cannot Create Accounts**: No permission to create any user accounts
- **Cannot Manage Batches**: Cannot create or manage student batches
- **Cannot Create Signup Codes**: Cannot generate or manage signup codes
- **Limited Class Access**: Can only manage their own created classes
- **Cannot Change Batch Link**: Once class is linked to batch, cannot modify the link
- **No System Administration**: No access to system-wide settings or user management

### **Student Role**

**Primary Function**: Learning and self-management

**Permissions:**

- **Self-Registration**: Create account using signup codes with automatic batch assignment
- **Class Access**:
  - View and join **Open** classes from their assigned batch
  - Request to join **Request-to-Join** classes from their batch
  - Access **Unlisted** classes only if manually added by teacher
- **Single Batch Access**: View classes linked only to their assigned batch
- **Track Attendance**: View their personal attendance records for enrolled classes
- **Lichess Integration**: Provide Lichess username for chess progress tracking via queue system
- **Profile Management**: Update their personal profile and settings
- **View Announcements**: Read class-specific, batch-specific, and academy-wide announcements
- **Account Management**: Delete own account if batch no longer exists

**Restrictions:**

- **Cannot Create Accounts**: Cannot create accounts for others
- **No Class Management**: No class creation or management permissions
- **Limited Data Access**: Cannot view other students' information or performance
- **Single Batch Limitation**: Cannot access classes from other batches

## Enhanced System Workflow

### **1. Batch-Centric Signup System (Admin)**

1. Admin creates batch with auto-generated signup code
2. Admin sets batch details and capacity
3. Students use signup code to register and are automatically assigned to that specific batch
4. No manual student assignment needed - fully automated based on signup code

### **2. Single-Batch Class Creation (Teacher)**

1. Teacher views available batches created by admin
2. Teacher creates class and selects **one batch** to link it to
3. **Batch link cannot be changed** once class is created
4. Teacher sets class visibility for students in that specific batch
5. Class becomes available only to students from the linked batch

### **3. Student Registration & Auto-Assignment**

1. Student receives batch-specific signup code from admin
2. Student self-registers using the code
3. Account automatically assigns to the specific batch associated with that code
4. Student gains access only to classes linked to their assigned batch

### **4. Lichess Username Integration (Queue-Based)**

1. Student logs into academy system and goes to profile settings
2. Student enters their Lichess username in the profile
3. System validates username format and adds to Lichess data fetch queue
4. Background worker processes queue and fetches chess data from Lichess API
5. System stores fetched data and displays chess performance to student

## Database Schema

### **Core Collections**

#### **1. Users Collection**

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  role: String, // 'admin', 'teacher', 'student'
  isActive: Boolean,
  accountCreationType: String, // 'admin_created', 'signup_code'
  createdBy: ObjectId,
  signupCodeUsed: String, // Reference to signup code used
  assignedBatch: ObjectId, // Single batch ID (for students only)
  createdAt: Date,
  updatedAt: Date
}
```

#### **2. UserDetails Collection**

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection

  // Personal Information
  firstName: String,
  lastName: String,
  fullName: String, // Computed field: firstName + lastName

  // Contact Information
  phoneNumber: String,
  alternatePhoneNumber: String, // Optional
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Profile Image
  profileImagePath: String, // Path to uploaded profile image
  profileImageUrl: String, // Full URL to access the image

  // Role-specific Information
  // For Students
  dateOfBirth: Date,
  parentName: String, // For students under 18
  parentPhoneNumber: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },

  // For Teachers
  qualification: String,
  experience: Number, // Years of experience
  specialization: String, // e.g., "Beginner Training", "Advanced Tactics"
  bio: String,

  // For Admins
  designation: String,
  department: String,

  // Additional Information
  gender: String, // 'male', 'female', 'other', 'prefer_not_to_say'
  nationality: String,

  // System Fields
  isProfileComplete: Boolean, // Whether all required fields are filled
  lastProfileUpdate: Date,

  createdAt: Date,
  updatedAt: Date
}
```

#### **3. Batches Collection**

```javascript
{
  _id: ObjectId,
  batchName: String, // e.g., "2025-2026 Advanced"
  description: String,
  createdBy: ObjectId, // Admin reference
  maxStudents: Number,
  currentStudents: Number,
  academicYear: String,

  // Integrated Signup Code
  signupCode: String (unique), // Auto-generated when batch is created
  signupCodeResetCount: Number,
  lastSignupCodeReset: Date,

  // Enhanced Deletion Tracking with Enum
  deletionStatus: String, // 'active', 'draft_deletion', 'permanently_deleted'
  markedForDeletionAt: Date,
  markedForDeletionBy: ObjectId,
  permanentlyDeletedAt: Date,
  permanentlyDeletedBy: ObjectId,
  deletionReason: String,

  // Student Management
  enrolledStudents: [ObjectId], // Students assigned to this batch
  linkedClasses: [ObjectId], // Classes linked to this batch

  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **4. Classes Collection**

```javascript
{
  _id: ObjectId,
  className: String,
  description: String,
  createdBy: ObjectId, // Teacher reference
  teacherId: ObjectId,

  // Single Batch Linking (Cannot be changed once set)
  linkedBatch: ObjectId, // Single batch ID - immutable after creation
  batchName: String, // For easy display
  batchLocked: Boolean, // True once batch is linked - prevents changes

  // Visibility System
  visibility: String, // 'open', 'unlisted', 'request_to_join'

  schedule: {
    dayOfWeek: String,
    startTime: String,
    endTime: String,
    duration: Number
  },
  maxStudents: Number,
  currentEnrolledStudents: Number,

  // Simplified Student Management
  enrolledStudents: [ObjectId], // All enrolled students regardless of how they joined
  pendingRequests: [ObjectId], // Only for request-to-join classes

  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **5. Attendance Collection**

```javascript
{
  _id: ObjectId,
  classId: ObjectId,
  teacherId: ObjectId,
  batchId: ObjectId, // Single batch reference
  sessionDate: Date,
  sessionTime: String,

  // Array-based attendance storage
  attendanceRecords: [
    {
      studentId: ObjectId,
      status: String, // 'present', 'absent', 'late', 'excused'
      notes: String,
      markedAt: Date
    }
  ],

  // Summary data
  totalStudents: Number,
  presentCount: Number,
  absentCount: Number,
  lateCount: Number,
  excusedCount: Number,

  markedBy: ObjectId,
  lastUpdatedAt: Date,
  isFinalized: Boolean,
  createdAt: Date
}
```

#### **6. Announcements Collection**

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,

  // Three-tier announcement system
  announcementType: String, // 'class', 'batch', 'academy'

  // Target References (based on type)
  targetClassId: ObjectId, // For class-specific announcements
  targetBatchId: ObjectId, // For batch-specific announcements
  // No target needed for academy-wide announcements

  authorId: ObjectId, // Admin/Teacher who posted
  authorRole: String, // 'admin', 'teacher'

  priority: String, // 'low', 'medium', 'high', 'urgent'
  isActive: Boolean,
  expiryDate: Date, // Optional

  // Engagement Tracking
  viewedBy: [ObjectId], // Students who have read this announcement

  createdAt: Date,
  updatedAt: Date
}
```

#### **7. LichessIntegration Collection** (Updated for Queue-Based System)

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  lichessUsername: String, // Manually entered by student

  // Data Fetch Status
  isLinked: Boolean, // Whether username has been validated and linked
  linkedAt: Date,
  lastSyncAt: Date,
  syncStatus: String, // 'pending', 'syncing', 'completed', 'error', 'not_found'
  errorMessage: String, // If sync failed, store error details

  // Queue Management
  queuedAt: Date, // When added to fetch queue
  queueRetryCount: Number, // Number of retry attempts
  nextRetryAt: Date, // When to retry if failed

  // Chess Data (synced from Lichess)
  currentRating: {
    bullet: Number,
    blitz: Number,
    rapid: Number,
    classical: Number,
    puzzle: Number
  },
  gamesPlayed: {
    total: Number,
    bullet: Number,
    blitz: Number,
    rapid: Number,
    classical: Number
  },
  winLossStats: {
    wins: Number,
    losses: Number,
    draws: Number
  },

  // Performance History (limited to recent data due to API constraints)
  performanceHistory: [
    {
      date: Date,
      rating: Number,
      gameType: String,
      ratingChange: Number
    }
  ],

  // Profile Information from Lichess
  lichessProfile: {
    title: String, // GM, IM, FM, etc.
    country: String,
    joinedAt: Date,
    language: String,
    isPatron: Boolean
  },

  createdAt: Date,
  updatedAt: Date
}
```

#### **8. LichessQueue Collection** (New - For Queue Management)

```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  lichessUsername: String,
  queueType: String, // 'initial_fetch', 'periodic_update', 'manual_refresh'
  priority: Number, // 1 = high, 2 = normal, 3 = low

  // Queue Status
  status: String, // 'waiting', 'processing', 'completed', 'failed'
  attempts: Number,
  maxAttempts: Number, // Default 3

  // Processing Details
  processingStartedAt: Date,
  processingCompletedAt: Date,
  errorDetails: String,

  // Retry Logic
  nextAttemptAt: Date,
  lastAttemptAt: Date,

  // Request Details
  requestedBy: ObjectId, // User who triggered this request
  requestReason: String, // 'new_username', 'manual_refresh', 'scheduled_update'

  createdAt: Date,
  updatedAt: Date
}
```

#### **9. Additional Collections**

- **ClassJoinRequests**: Student requests for request-to-join classes
- **BatchDeletionLogs**: Comprehensive tracking of batch deletion process

## Final Page Structure with Tabs

### **Admin Pages**

#### **1. Admin Dashboard**

**Main View**: System overview with key metrics and quick actions

- **Tabs**: Overview, Recent Activity, System Health

#### **2. Manage Batches**

**Main View**: List of all batches with search and filter options
**Tabs**:

- **Active Batches**: Current active batches with student counts
- **Signup Codes**: Manage and reset signup codes for batches
- **Archived Batches**: View deleted/archived batches
- **Create New Batch**: Form to create new batch with auto-generated signup code

#### **3. Manage Classes**

**Main View**: List of all classes across all teachers and batches
**Tabs**:

- **All Classes**: Complete list of classes with filters
- **By Teacher**: Classes organized by teacher
- **By Batch**: Classes organized by batch
- **Class Analytics**: Performance metrics and statistics

#### **4. Manage Users**

**Main View**: Overview of all users in the system
**Tabs**:

- **Teachers**: Create and manage teacher accounts with profile details
- **Admins**: Create and manage admin accounts with profile details
- **Students**: View student accounts, batch assignments, and profile information
- **User Analytics**: Registration patterns and user engagement

#### **5. Create Announcement**

**Main View**: Announcement creation form
**Tabs**:

- **Create New**: Form to create announcements (Academy/Batch/Class)
- **Manage Announcements**: View and edit existing announcements
- **Analytics**: Announcement engagement and read rates

#### **6. Profile Settings**

**Main View**: Admin personal profile management
**Tabs**:

- **Personal Info**: Basic profile information from UserDetails
- **Profile Picture**: Upload and manage profile image
- **Contact Details**: Phone numbers and address information
- **Security**: Password and login settings
- **Preferences**: UI preferences and notifications

#### **7. Settings**

**Main View**: System-wide configuration
**Tabs**:

- **General**: Basic academy settings
- **Integrations**: Lichess API configuration and queue settings
- **Security**: System security policies
- **Backup**: Data backup and restore options

### **Teacher Pages**

#### **1. Teacher Dashboard**

**Main View**: Teacher's personalized overview
**Tabs**:

- **Today's Schedule**: Classes scheduled for today
- **Quick Actions**: Mark attendance, create announcements
- **Performance Overview**: Summary of classes and student progress

#### **2. Manage Classes**

**Main View**: List of teacher's created classes
**Tabs**:

- **My Classes**: List of all created classes
- **Create Class**: Form to create new class with batch linking
- **Join Requests**: Manage student requests for request-to-join classes
- **Class Analytics**: Performance metrics for teacher's classes

**Individual Class View** (when clicking on a specific class):

- **Overview**: Class details and enrolled students with profile pictures
- **Attendance**: Mark and view attendance records
- **Students**: Manage enrolled students and their performance with contact details
- **Announcements**: Class-specific announcements
- **Performance**: Chess performance data of enrolled students (from Lichess queue)

#### **3. Create Announcement**

**Main View**: Announcement creation for teachers
**Tabs**:

- **Create New**: Form to create announcements (Academy/Batch/Class)
- **My Announcements**: View and manage teacher's announcements
- **Engagement**: View announcement read rates and responses

#### **4. Profile Settings**

**Main View**: Teacher personal profile
**Tabs**:

- **Personal Info**: Profile details and bio from UserDetails
- **Profile Picture**: Upload and manage profile image
- **Teaching Info**: Specialization, experience, and qualifications
- **Contact Details**: Phone numbers and address information
- **Security**: Password and account settings

#### **5. Settings**

**Main View**: Teacher preferences
**Tabs**:

- **Notifications**: Email and system notification preferences
- **Display**: UI customization options
- **Privacy**: Data sharing and visibility settings

### **Student Pages**

#### **1. Student Dashboard**

**Main View**: Student's personalized homepage
**Tabs**:

- **Overview**: Today's classes and recent announcements
- **Quick Access**: Fast navigation to important features
- **Performance Summary**: Chess progress overview from Lichess data

#### **2. My Classes**

**Main View**: Student's enrolled and available classes from their batch
**Tabs**:

- **Enrolled Classes**: Classes student is currently enrolled in
- **Available Classes**: Open classes from their batch they can join
- **Join Requests**: Sent requests for request-to-join classes

**Individual Class View** (when clicking on a specific class):

- **Overview**: Class details and teacher information with profile picture
- **Attendance**: Personal attendance records for this class
- **Announcements**: Class-specific announcements
- **Performance**: Personal chess progress related to this class
- **Schedule**: Class timetable and upcoming sessions

#### **3. View Announcements**

**Main View**: All announcements relevant to the student
**Tabs**:

- **Recent**: Latest announcements across all categories
- **Academy**: Academy-wide announcements
- **Batch**: Announcements specific to student's batch
- **Classes**: Announcements from enrolled classes

#### **4. Profile Settings**

**Main View**: Student personal profile
**Tabs**:

- **Personal Info**: Basic profile information from UserDetails
- **Profile Picture**: Upload and manage profile image
- **Contact Details**: Phone numbers, address, and emergency contact information
- **Parent/Guardian Info**: Parent details and contact information
- **Lichess Integration**: Enter Lichess username and view sync status
- **Chess Performance**: Detailed chess statistics and progress from queued data
- **Security**: Password and account settings

#### **5. Settings**

**Main View**: Student preferences
**Tabs**:

- **Notifications**: Announcement and reminder preferences
- **Display**: UI customization and accessibility options
- **Privacy**: Data sharing preferences

## Lichess Queue-Based Integration System

### **Queue Management with Bull Queue**

#### **Queue Setup and Configuration**

```javascript
// lichessQueue.js
const Queue = require("bull");
const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const lichessQueue = new Queue("lichess data fetch", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  settings: {
    stalledInterval: 30 * 1000, // 30 seconds
    maxStalledCount: 3,
  },
});

// Configure queue processing
lichessQueue.process("fetchUserData", 1, require("./lichessWorker")); // Process 1 job at a time

// Queue events
lichessQueue.on("completed", (job, result) => {
  console.log(`Lichess data fetch completed for job ${job.id}`);
});

lichessQueue.on("failed", (job, err) => {
  console.log(`Lichess data fetch failed for job ${job.id}:`, err.message);
});

module.exports = lichessQueue;
```

#### **Lichess Worker Implementation**

```javascript
// lichessWorker.js
const axios = require('axios');
const LichessIntegration = require('../models/LichessIntegration');
const LichessQueue = require('../models/LichessQueue');

module.exports = async function(job) {
  const { studentId, lichessUsername, queueId } = job.data;

  try {
    // Update queue status to processing
    await LichessQueue.updateOne(
      { _id: queueId },
      {
        status: 'processing',
        processingStartedAt: new Date(),
        lastAttemptAt: new Date()
      }
    );

    // Respect rate limit - wait if needed
    await enforceRateLimit();

    // Fetch user profile
    const profileResponse = await axios.get(`https://lichess.org/api/user/${lichessUsername}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ChessAcademy/1.0'
      }
    });

    if (profileResponse.status === 404) {
      throw new Error('Lichess username not found');
    }

    const profile = profileResponse.data;

    // Fetch recent games (limited due to rate limits)
    const gamesResponse = await axios.get(
      `https://lichess.org/api/games/user/${lichessUsername}?max=10&format=json`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'ChessAcademy/1.0'
        }
      }
    );

    const recentGames = gamesResponse.data;

    // Process and store data
    const lichessData = {
      studentId,
      lichessUsername,
      isLinked: true,
      linkedAt: new Date(),
      lastSyncAt: new Date(),
      syncStatus: 'completed',

      currentRating: {
        bullet: profile.perfs?.bullet?.rating || 0,
        blitz: profile.perfs?.blitz?.rating || 0,
        rapid: profile.perfs?.rapid?.rating || 0,
        classical: profile.perfs?.classical?.rating || 0,
        puzzle: profile.perfs?.puzzle?.rating || 0
      },

      gamesPlayed: {
        total: profile.count?.all || 0,
        bullet: profile.count?.bullet || 0,
        blitz: profile.count?.blitz || 0,
        rapid: profile.count?.rapid || 0,
        classical: profile.count?.classical || 0
      },

      winLossStats: {
        wins: profile.count?.win || 0,
        losses: profile.count?.loss || 0,
        draws: profile.count?.draw || 0
      },

      lichessProfile: {
        title: profile.title || null,
        country: profile.profile?.country || null,
        joinedAt: new Date(profile.createdAt),
        language: profile.profile?.language || null,
        isPatron: profile.patron || false
      },

      performanceHistory: recentGames.slice(0, 10).map(game => ({
        date: new Date(game.createdAt),
        rating: game.players.white.user?.id === lichessUsername ?
          game.players.white.rating : game.players.black.rating,
        gameType: game.speed,
        ratingChange: game.players.white.user?.id === lichessUsername ?
          (game.players.white.ratingDiff || 0) : (game.players.black.ratingDiff || 0)
      }))
    };

    // Update or create lichess integration record
    await LichessIntegration.findOneAndUpdate(
      { studentId },
      lichessData,
      { upsert: true, new: true }
    );

    // Mark queue item as completed
    await LichessQueue.updateOne(
      { _id: queueId },
      {
        status: 'completed',
        processingCompletedAt: new Date()
      }
    );

    return { success: true, username: lichessUsername };

  } catch (error) {
    // Handle errors and update queue
    await LichessQueue.updateOne(
      { _id: queueId },
      {
        status: 'failed',
        errorDetails: error.message,
        processingCompletedAt: new Date(),
        $inc: { attempts: 1 }
      }
    );

    // Update integration record with error
    await LichessIntegration.updateOne(
      { studentId },
      {
        syncStatus: 'error',
        errorMessage: error.message,
        lastSyncAt: new Date()
      }
    );

    // Schedule retry if attempts  {
        addToLichessQueue(studentId, lichessUsername, 'retry', queueId);
      }, delay);
    }

    throw error;
  }
};

// Rate limit enforcement
const lastRequestTime = { value: 0 };
async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime.value;
  const minInterval = 60000; // 1 minute between requests

  if (timeSinceLastRequest  setTimeout(resolve, waitTime));
  }

  lastRequestTime.value = Date.now();
}
```

#### **Queue Management Functions**

```javascript
// lichessService.js
const lichessQueue = require("./lichessQueue");
const LichessQueue = require("../models/LichessQueue");

// Add username to fetch queue
const addToLichessQueue = async (
  studentId,
  lichessUsername,
  reason = "new_username",
  queueId = null
) => {
  try {
    // Create queue record if not exists
    if (!queueId) {
      const queueRecord = await LichessQueue.create({
        studentId,
        lichessUsername,
        queueType:
          reason === "manual_refresh"
            ? "manual_refresh"
            : reason === "scheduled_update"
            ? "periodic_update"
            : "initial_fetch",
        priority: reason === "manual_refresh" ? 1 : 2,
        status: "waiting",
        attempts: 0,
        maxAttempts: 3,
        requestedBy: studentId,
        requestReason: reason,
      });
      queueId = queueRecord._id;
    }

    // Add to Bull queue with appropriate delay and priority
    const jobOptions = {
      priority: reason === "manual_refresh" ? 1 : 2,
      delay: reason === "manual_refresh" ? 0 : 5000, // Immediate for manual, 5s delay for others
      attempts: 1, // We handle retries manually
      removeOnComplete: 10,
      removeOnFail: 10,
    };

    await lichessQueue.add(
      "fetchUserData",
      {
        studentId,
        lichessUsername,
        queueId,
      },
      jobOptions
    );

    return queueId;
  } catch (error) {
    console.error("Error adding to Lichess queue:", error);
    throw error;
  }
};

// Get queue status for a student
const getQueueStatus = async (studentId) => {
  const queueItem = await LichessQueue.findOne({
    studentId,
    status: { $in: ["waiting", "processing"] },
  }).sort({ createdAt: -1 });

  return queueItem;
};

// Manual refresh trigger
const triggerManualRefresh = async (studentId, lichessUsername) => {
  // Check if already in queue
  const existingQueue = await getQueueStatus(studentId);
  if (existingQueue) {
    throw new Error("Data fetch already in progress. Please wait.");
  }

  return await addToLichessQueue(studentId, lichessUsername, "manual_refresh");
};

module.exports = {
  addToLichessQueue,
  getQueueStatus,
  triggerManualRefresh,
};
```

### **Student Lichess Integration UI**

#### **Lichess Username Setup (Student Profile)**

```javascript
// LichessIntegration component
import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Button, Alert, Progress,
  Text, VStack, HStack, Badge, useToast
} from '@chakra-ui/react';

const LichessIntegration = ({ studentId }) => {
  const [lichessUsername, setLichessUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [lichessData, setLichessData] = useState(null);
  const toast = useToast();

  // Load existing data
  useEffect(() => {
    loadLichessData();
    loadQueueStatus();
  }, [studentId]);

  const loadLichessData = async () => {
    try {
      const response = await fetch(`/api/student/lichess/data`);
      const data = await response.json();
      if (data.lichessData) {
        setLichessData(data.lichessData);
        setLichessUsername(data.lichessData.lichessUsername);
      }
    } catch (error) {
      console.error('Error loading Lichess data:', error);
    }
  };

  const loadQueueStatus = async () => {
    try {
      const response = await fetch(`/api/student/lichess/queue-status`);
      const data = await response.json();
      setQueueStatus(data.queueStatus);
    } catch (error) {
      console.error('Error loading queue status:', error);
    }
  };

  const handleSubmitUsername = async () => {
    if (!lichessUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid Lichess username',
        status: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/student/lichess/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lichessUsername: lichessUsername.trim() })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Lichess username added to fetch queue. Data will be available shortly.',
          status: 'success'
        });
        loadQueueStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/student/lichess/manual-refresh', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Refresh Initiated',
          description: 'Your chess data is being updated. Please check back in a few minutes.',
          status: 'success'
        });
        loadQueueStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (



          Lichess Username

             setLichessUsername(e.target.value)}
              placeholder="Enter your Lichess username"
              isDisabled={isLoading || queueStatus?.status === 'processing'}
            />

              {lichessData ? 'Update' : 'Link Account'}





      {/* Queue Status */}
      {queueStatus && (



              Status:

                {queueStatus.status}


            {queueStatus.status === 'processing' && (

                Fetching data from Lichess...


            )}
            {queueStatus.status === 'waiting' && (

                Position in queue: {queueStatus.attempts + 1} |
                Next attempt: {new Date(queueStatus.nextAttemptAt).toLocaleTimeString()}

            )}


      )}

      {/* Chess Data Display */}
      {lichessData && lichessData.isLinked && (


            Chess Performance

              Refresh Data



          {/* Rating Display */}


              Last updated: {new Date(lichessData.lastSyncAt).toLocaleString()}



              {Object.entries(lichessData.currentRating).map(([gameType, rating]) => (
                rating > 0 && (

                    {rating}

                      {gameType}


                )
              ))}



              Games Played: {lichessData.gamesPlayed.total}
              Wins: {lichessData.winLossStats.wins}
              Losses: {lichessData.winLossStats.losses}
              Draws: {lichessData.winLossStats.draws}



      )}

      {/* Error Display */}
      {lichessData && lichessData.syncStatus === 'error' && (


            Sync Error
            {lichessData.errorMessage}

              Retry



      )}

  );
};
```

## API Endpoints for Queue-Based Lichess Integration

```javascript
// Lichess integration endpoints
POST /api/student/lichess/link - Link Lichess username and add to queue
GET /api/student/lichess/data - Get student's chess data
GET /api/student/lichess/queue-status - Get current queue status
POST /api/student/lichess/manual-refresh - Trigger manual data refresh
DELETE /api/student/lichess/unlink - Remove Lichess integration

// Admin endpoints for queue management
GET /api/admin/lichess/queue - View all queue items and their status
PUT /api/admin/lichess/queue/:id/retry - Manually retry failed queue item
DELETE /api/admin/lichess/queue/:id - Remove item from queue
GET /api/admin/lichess/analytics - Queue performance and sync statistics
```

## Batch Deletion Process

### **Draft Deletion Status**

```javascript
// Mark batch for deletion (reversible)
const markBatchForDeletion = async (batchId, adminId, reason) => {
  await Batch.updateOne(
    { _id: batchId },
    {
      deletionStatus: "draft_deletion",
      markedForDeletionAt: new Date(),
      markedForDeletionBy: adminId,
      deletionReason: reason,
      isActive: false, // Temporarily deactivate
    }
  );

  // Notify affected students
  await notifyBatchStudents(batchId, "batch_marked_for_deletion");
};
```

### **Permanent Deletion Process**

```javascript
// Permanently delete batch and all related data
const permanentlyDeleteBatch = async (batchId, adminId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Get all linked classes
      const linkedClasses = await Class.find({ linkedBatch: batchId });
      const classIds = linkedClasses.map((c) => c._id);

      // 2. Delete all attendance records for these classes
      await Attendance.deleteMany({ batchId: batchId });
      await Attendance.deleteMany({ classId: { $in: classIds } });

      // 3. Delete all class join requests
      await ClassJoinRequest.deleteMany({ classId: { $in: classIds } });

      // 4. Delete all linked classes
      await Class.deleteMany({ linkedBatch: batchId });

      // 5. Delete batch-specific announcements
      await Announcement.deleteMany({ targetBatchId: batchId });
      await Announcement.deleteMany({ targetClassId: { $in: classIds } });

      // 6. Clean up Lichess queue items for batch students
      const batchStudents = await User.find({ assignedBatch: batchId }).select(
        "_id"
      );
      const studentIds = batchStudents.map((s) => s._id);
      await LichessQueue.deleteMany({ studentId: { $in: studentIds } });

      // 7. Update batch status to permanently deleted
      await Batch.updateOne(
        { _id: batchId },
        {
          deletionStatus: "permanently_deleted",
          permanentlyDeletedAt: new Date(),
          permanentlyDeletedBy: adminId,
        }
      );

      // 8. Notify affected students to delete accounts
      await notifyBatchStudents(batchId, "batch_permanently_deleted");
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

## Three-Tier Announcement System

### **Class Announcements**

- **Scope**: Only students enrolled in specific class
- **Creators**: Class teacher and admins
- **Examples**: "Tomorrow's class moved to 3 PM", "Bring chess notation books"

### **Batch Announcements**

- **Scope**: All students in specific batch
- **Creators**: Any teacher (for any batch) and admins
- **Examples**: "2025-2026 batch tournament next month", "Batch-specific holiday schedule"

### **Academy Announcements**

- **Scope**: All users (students, teachers, admins)
- **Creators**: Teachers and admins
- **Examples**: "Academy closed on public holiday", "New chess coach joining"

## Key Implementation Notes

### **Security Considerations**

- **Queue Security**: Validate all queue inputs and prevent queue poisoning attacks
- **Rate Limit Compliance**: Strict adherence to Lichess API rate limits to avoid IP bans
- **Data Privacy**: Secure handling of chess performance data and usernames
- **Error Handling**: Comprehensive error handling for API failures and network issues

### **Performance Optimizations**

- **Queue Efficiency**: Optimized queue processing with proper priority handling
- **Background Processing**: Non-blocking queue operations that don't affect user experience
- **Data Caching**: Cache frequently accessed chess data to reduce queue load
- **Retry Logic**: Intelligent retry mechanisms with exponential backoff

### **User Experience Enhancements**

- **Real-time Status Updates**: Live updates on data fetch progress
- **Clear Error Messages**: User-friendly error messages for failed syncs
- **Manual Refresh Option**: Allow users to trigger immediate data updates
- **Progress Indicators**: Visual feedback during data fetching process

## Development Workflow

1. **Setup MERN stack** with Chakra UI and required dependencies
2. **Configure Redis and Bull Queue** for background job processing
3. **Implement authentication** with role-based access control
4. **Create database schemas** with proper relationships and indexing
5. **Build UserDetails system** with profile image upload functionality
6. **Develop enhanced user management** with profile information
7. **Create Lichess queue system** with rate limit compliance
8. **Build queue worker** for Lichess data fetching
9. **Implement queue management UI** for students and admins
10. **Build admin signup code system** with flexible validity options
11. **Develop batch management** with student assignment capabilities
12. **Create enhanced class system** with visibility options
13. **Implement join request workflow** for request-to-join classes
14. **Build attendance management** with array-based storage
15. **Add announcement system** with targeted messaging
16. **Implement batch deletion handling** with queue cleanup
17. **Create comprehensive admin controls** for all system entities
18. **Build tabbed interface structure** for all role-specific pages
19. **Add analytics and reporting** features with chess performance data
20. **Implement mobile export** using Capacitor
21. **Deployment** with proper security measures and queue monitoring

This comprehensive documentation now includes the queue-based Lichess integration system that properly handles the API rate limits while providing students with chess performance tracking through a user-friendly interface that shows real-time sync status and progress.
