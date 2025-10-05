import express from "express";
import { protect } from "../middleware/auth.js";
import LichessAccount from "../models/LichessAccount.js";
import User from "../models/User.js";

const router = express.Router();

// Helper function to check if sync is needed
const isSyncNeeded = (lastSyncAt, isStudentLogin = false) => {
  if (!lastSyncAt) return true; // Never synced before
  
  const now = new Date();
  const lastSync = new Date(lastSyncAt);
  const hoursSinceLastSync = (now - lastSync) / (1000 * 60 * 60);
  
  if (isStudentLogin) {
    // For student login: sync only once per day (24 hours)
    return hoursSinceLastSync >= 24;
  } else {
    // For teacher view: sync if more than 24 hours old
    return hoursSinceLastSync >= 24;
  }
};

// Helper function to fetch Lichess user data
const fetchLichessUserData = async (username) => {
  try {
    const response = await fetch(`https://lichess.org/api/user/${username}`);
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching Lichess data for ${username}:`, error);
    throw error;
  }
};

// Auto sync for student on login/page load
router.post("/auto-sync-student", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    console.log(`\n=== STUDENT AUTO SYNC START ===`);
    console.log(`User ID: ${userId}`);
    console.log(`User Email: ${userEmail}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    const lichessAccount = await LichessAccount.findOne({ userId }).populate('userId');
    if (!lichessAccount) {
      console.log(`❌ No Lichess account found for user: ${userId}`);
      console.log(`=== STUDENT AUTO SYNC END (NO ACCOUNT) ===\n`);
      return res.json({
        success: true,
        message: "No Lichess account found",
        synced: false
      });
    }

    if (!lichessAccount.isConnected) {
      console.log(`❌ Lichess account not connected for user: ${userId}`);
      console.log(`=== STUDENT AUTO SYNC END (NOT CONNECTED) ===\n`);
      return res.json({
        success: true,
        message: "Lichess account not connected",
        synced: false
      });
    }

    console.log(`✅ Found connected Lichess account: ${lichessAccount.lichessUsername}`);
    console.log(`Last sync: ${lichessAccount.lastSyncAt || 'Never'}`);
    console.log(`🔄 Starting immediate sync for student (no time restriction)...`);
    
    // For students: Always sync (no time restriction)
    // Fetch fresh data from Lichess API
    const startTime = Date.now();
    const lichessData = await fetchLichessUserData(lichessAccount.lichessUsername);
    const fetchTime = Date.now() - startTime;
    
    console.log(`📡 Lichess API fetch completed in ${fetchTime}ms`);
    console.log(`📊 Games fetched: ${lichessData.count?.all || 0}`);
    console.log(`🏆 Current rating: ${lichessData.perfs?.blitz?.rating || lichessData.perfs?.rapid?.rating || 'N/A'}`);
    
    // Update database
    const dbStartTime = Date.now();
    lichessAccount.accountData = lichessData;
    lichessAccount.lastSyncAt = new Date();
    await lichessAccount.save();
    const dbTime = Date.now() - dbStartTime;

    console.log(`💾 Database update completed in ${dbTime}ms`);
    console.log(`✅ Auto sync completed for: ${lichessAccount.lichessUsername}`);
    console.log(`New last sync time: ${lichessAccount.lastSyncAt}`);
    console.log(`=== STUDENT AUTO SYNC END (SUCCESS) ===\n`);

    res.json({
      success: true,
      message: "Auto sync completed successfully",
      synced: true,
      lastSyncAt: lichessAccount.lastSyncAt
    });

  } catch (error) {
    console.error(`\n❌ STUDENT AUTO SYNC ERROR:`);
    console.error(`User ID: ${req.user._id}`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`=== STUDENT AUTO SYNC END (ERROR) ===\n`);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to auto sync Lichess data",
      synced: false
    });
  }
});

// Auto sync for teacher when viewing student (if last sync > 24 hours)
router.post("/auto-sync-teacher/:username", protect, async (req, res) => {
  try {
    const { username } = req.params;
    const teacherId = req.user._id;
    const teacherEmail = req.user.email;
    
    console.log(`\n=== TEACHER AUTO SYNC START ===`);
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`Teacher Email: ${teacherEmail}`);
    console.log(`Target Student Username: ${username}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Verify teacher permission
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      console.log(`❌ Access denied. User role: ${req.user.role}`);
      console.log(`=== TEACHER AUTO SYNC END (ACCESS DENIED) ===\n`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Only teachers can access student data."
      });
    }

    const lichessAccount = await LichessAccount.findOne({ lichessUsername: username }).populate('userId');
    if (!lichessAccount || !lichessAccount.isConnected) {
      console.log(`❌ No connected Lichess account found for student: ${username}`);
      console.log(`=== TEACHER AUTO SYNC END (NO STUDENT ACCOUNT) ===\n`);
      return res.json({
        success: true,
        message: "No Lichess account found for this student",
        synced: false
      });
    }

    console.log(`✅ Found student Lichess account: ${lichessAccount.lichessUsername}`);
    console.log(`Student User ID: ${lichessAccount.userId._id}`);
    console.log(`Last sync: ${lichessAccount.lastSyncAt || 'Never'}`);

    // Check if sync is needed (more than 24 hours old)
    const syncNeeded = isSyncNeeded(lichessAccount.lastSyncAt, false);
    console.log(`📅 Sync needed (>24h rule): ${syncNeeded}`);
    
    if (!syncNeeded) {
      const timeSinceSync = lichessAccount.lastSyncAt ? 
        Math.round((new Date() - new Date(lichessAccount.lastSyncAt)) / (1000 * 60 * 60)) : 'N/A';
      console.log(`⏳ Sync not needed - last synced ${timeSinceSync} hours ago`);
      console.log(`=== TEACHER AUTO SYNC END (NOT NEEDED) ===\n`);
      return res.json({
        success: true,
        message: "Sync not needed - data is recent",
        synced: false,
        lastSyncAt: lichessAccount.lastSyncAt
      });
    }

    console.log(`🔄 Starting auto sync for teacher view (24h+ elapsed)...`);
    
    // Fetch fresh data from Lichess API
    const startTime = Date.now();
    const lichessData = await fetchLichessUserData(lichessAccount.lichessUsername);
    const fetchTime = Date.now() - startTime;
    
    console.log(`📡 Lichess API fetch completed in ${fetchTime}ms`);
    console.log(`📊 Games fetched: ${lichessData.count?.all || 0}`);
    console.log(`🏆 Current rating: ${lichessData.perfs?.blitz?.rating || lichessData.perfs?.rapid?.rating || 'N/A'}`);
    
    // Update database
    const dbStartTime = Date.now();
    lichessAccount.accountData = lichessData;
    lichessAccount.lastSyncAt = new Date();
    await lichessAccount.save();
    const dbTime = Date.now() - dbStartTime;

    console.log(`💾 Database update completed in ${dbTime}ms`);
    console.log(`✅ Auto sync completed for teacher view: ${lichessAccount.lichessUsername}`);
    console.log(`New last sync time: ${lichessAccount.lastSyncAt}`);
    console.log(`=== TEACHER AUTO SYNC END (SUCCESS) ===\n`);

    res.json({
      success: true,
      message: "Auto sync completed successfully",
      synced: true,
      lastSyncAt: lichessAccount.lastSyncAt
    });

  } catch (error) {
    console.error(`\n❌ TEACHER AUTO SYNC ERROR:`);
    console.error(`Teacher ID: ${req.user._id}`);
    console.error(`Target Username: ${req.params.username}`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`=== TEACHER AUTO SYNC END (ERROR) ===\n`);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to auto sync Lichess data",
      synced: false
    });
  }
});

// Manual sync for teacher when viewing student (force sync regardless of time)
router.post("/manual-sync-teacher/:username", protect, async (req, res) => {
  try {
    const { username } = req.params;
    const teacherId = req.user._id;
    const teacherEmail = req.user.email;
    
    console.log(`\n=== TEACHER MANUAL SYNC START ===`);
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`Teacher Email: ${teacherEmail}`);
    console.log(`Target Student Username: ${username}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Verify teacher permission
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      console.log(`❌ Access denied. User role: ${req.user.role}`);
      console.log(`=== TEACHER MANUAL SYNC END (ACCESS DENIED) ===\n`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Only teachers can access student data."
      });
    }

    const lichessAccount = await LichessAccount.findOne({ lichessUsername: username }).populate('userId');
    if (!lichessAccount || !lichessAccount.isConnected) {
      console.log(`❌ No connected Lichess account found for student: ${username}`);
      console.log(`=== TEACHER MANUAL SYNC END (NO STUDENT ACCOUNT) ===\n`);
      return res.status(404).json({
        success: false,
        message: "No Lichess account found for this student"
      });
    }

    console.log(`✅ Found student Lichess account: ${lichessAccount.lichessUsername}`);
    console.log(`Student User ID: ${lichessAccount.userId._id}`);
    console.log(`Last sync: ${lichessAccount.lastSyncAt || 'Never'}`);
    console.log(`🔄 Starting manual sync (forced, no time restriction)...`);
    
    // Fetch fresh data from Lichess API
    const startTime = Date.now();
    const lichessData = await fetchLichessUserData(lichessAccount.lichessUsername);
    const fetchTime = Date.now() - startTime;
    
    console.log(`📡 Lichess API fetch completed in ${fetchTime}ms`);
    console.log(`📊 Games fetched: ${lichessData.count?.all || 0}`);
    console.log(`🏆 Current rating: ${lichessData.perfs?.blitz?.rating || lichessData.perfs?.rapid?.rating || 'N/A'}`);
    
    // Update database
    const dbStartTime = Date.now();
    lichessAccount.accountData = lichessData;
    lichessAccount.lastSyncAt = new Date();
    await lichessAccount.save();
    const dbTime = Date.now() - dbStartTime;

    console.log(`💾 Database update completed in ${dbTime}ms`);
    console.log(`✅ Manual sync completed for teacher: ${lichessAccount.lichessUsername}`);
    console.log(`New last sync time: ${lichessAccount.lastSyncAt}`);
    console.log(`=== TEACHER MANUAL SYNC END (SUCCESS) ===\n`);

    res.json({
      success: true,
      message: "Manual sync completed successfully",
      synced: true,
      lastSyncAt: lichessAccount.lastSyncAt
    });

  } catch (error) {
    console.error(`\n❌ TEACHER MANUAL SYNC ERROR:`);
    console.error(`Teacher ID: ${req.user._id}`);
    console.error(`Target Username: ${req.params.username}`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`=== TEACHER MANUAL SYNC END (ERROR) ===\n`);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to manually sync Lichess data",
      synced: false
    });
  }
});

// Check sync status without syncing
router.get("/sync-status", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const lichessAccount = await LichessAccount.findOne({ userId });
    if (!lichessAccount || !lichessAccount.isConnected) {
      return res.json({
        success: true,
        isConnected: false,
        lastSyncAt: null,
        syncNeeded: false
      });
    }

    const syncNeeded = isSyncNeeded(lichessAccount.lastSyncAt, true);

    res.json({
      success: true,
      isConnected: true,
      lichessUsername: lichessAccount.lichessUsername,
      lastSyncAt: lichessAccount.lastSyncAt,
      syncNeeded: syncNeeded
    });

  } catch (error) {
    console.error('Check sync status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to check sync status"
    });
  }
});

export default router;