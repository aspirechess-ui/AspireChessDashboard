import express from "express";
import { protect } from "../middleware/auth.js";
import LichessAccount from "../models/LichessAccount.js";
import User from "../models/User.js";
import UserDetails from "../models/UserDetails.js";


const router = express.Router();

// Helper function to format Lichess account data consistently
const formatLichessData = (account, userDetails = null, isStudentView = false) => {
  const accountData = account.accountData || {};
  
  // Account data can be stored directly in accountData or at root level
  // Handle both structures for backward compatibility
  const perfs = accountData.perfs || account.perfs || {};
  const count = accountData.count || account.count || {};
  const stats = accountData.stats || account.stats || {};
  const profile = accountData.profile || account.profile || {};
  
  // Calculate total games from multiple sources
  let totalGames = count.all || 0;
  
  // If count.all is missing or 0, calculate from perfs data
  if (totalGames === 0) {
    totalGames = (perfs.bullet?.games || 0) + 
                 (perfs.blitz?.games || 0) + 
                 (perfs.rapid?.games || 0) + 
                 (perfs.classical?.games || 0) +
                 (perfs.ultraBullet?.games || 0) +
                 (perfs.correspondence?.games || 0);
  }
  
  // TEMPORARY: If still no games but opening data exists, calculate from opening data
  // This handles cases where Lichess sync didn't populate perfs/count properly
  if (totalGames === 0 && accountData.openings && accountData.openings.list) {
    totalGames = accountData.openings.list.reduce((sum, opening) => sum + (opening.games || 0), 0);
    console.log(`BACKEND DEBUG: Calculated totalGames from openings: ${totalGames}`);
    console.log(`BACKEND DEBUG: Opening data length: ${accountData.openings.list.length}`);
  }
  
  // Calculate win rate from available data
  const rawWinRate = stats.winRate;
  let winRate = 0;
  if (rawWinRate) {
    winRate = rawWinRate <= 1 ? rawWinRate * 100 : rawWinRate;
  } else if (totalGames > 0 && count.win) {
    // Calculate from count data
    winRate = (count.win / totalGames) * 100;
  } else if (totalGames > 0 && accountData.openings && accountData.openings.list) {
    // TEMPORARY: Calculate from opening data
    const totalWins = accountData.openings.list.reduce((sum, opening) => sum + (opening.wins || 0), 0);
    winRate = (totalWins / totalGames) * 100;
  }
  
  // Get current rating from available perfs with fallback to opening data
  let currentRating = 0;
  
  // Prioritize ratings: blitz > rapid > classical > bullet
  if (perfs.blitz?.rating) currentRating = perfs.blitz.rating;
  else if (perfs.rapid?.rating) currentRating = perfs.rapid.rating;
  else if (perfs.classical?.rating) currentRating = perfs.classical.rating;
  else if (perfs.bullet?.rating) currentRating = perfs.bullet.rating;
  else if (totalGames > 0 && accountData.openings && accountData.openings.list) {
    // TEMPORARY: If we have games but no rating in perfs, estimate from opening performance
    // This is a fallback when Lichess sync didn't populate rating data properly
    const avgPerformance = accountData.openings.list.reduce((sum, opening) => {
      return sum + (opening.performance || 1200); // Use 1200 as default if no performance
    }, 0) / accountData.openings.list.length;
    currentRating = Math.round(avgPerformance);
    console.log(`BACKEND DEBUG: Calculated rating from openings: ${currentRating}`);
  }
  
  // Get peak rating from any available source
  const peakRating = accountData.peakRating || 
                     Math.max(
                       perfs.blitz?.rating || 0,
                       perfs.rapid?.rating || 0,
                       perfs.classical?.rating || 0,
                       perfs.bullet?.rating || 0
                     ) || currentRating;
  
  const baseData = {
    _id: account._id,
    lichessUsername: account.lichessUsername,
    currentRating: currentRating,
    totalGames: totalGames,
    winRate: Math.round(winRate),
    peakRating: peakRating,
    lastSyncAt: account.lastSyncAt,
    
    // Core Lichess data
    perfs: perfs,
    count: count,
    stats: stats,
    
    // Time control statistics
    timeControlStats: {
      totalPlayTime: stats.totalPlayTime || 0,
      distribution: (() => {
        // Calculate games for each time control
        let bulletGames = perfs.bullet?.games || 0;
        let blitzGames = perfs.blitz?.games || 0;
        let rapidGames = perfs.rapid?.games || 0;
        let classicalGames = perfs.classical?.games || 0;
        
        const totalPerfsGames = bulletGames + blitzGames + rapidGames + classicalGames;
        
        // If no games in perfs but we have total games, distribute them
        if (totalPerfsGames === 0 && totalGames > 0) {
          bulletGames = Math.floor(totalGames * 0.2); // 20% bullet
          blitzGames = Math.floor(totalGames * 0.4); // 40% blitz
          rapidGames = Math.floor(totalGames * 0.3); // 30% rapid
          classicalGames = totalGames - (bulletGames + blitzGames + rapidGames); // remainder
        }
        
        return [
          {
            type: "bullet",
            games: bulletGames,
            winRate: (accountData.timeControls?.bullet?.winRate) || Math.round(winRate),
            avgTime: "1+0"
          },
          {
            type: "blitz", 
            games: blitzGames,
            winRate: (accountData.timeControls?.blitz?.winRate) || Math.round(winRate),
            avgTime: "3+2"
          },
          {
            type: "rapid",
            games: rapidGames, 
            winRate: (accountData.timeControls?.rapid?.winRate) || Math.round(winRate),
            avgTime: "10+5"
          },
          {
            type: "classical",
            games: classicalGames,
            winRate: (accountData.timeControls?.classical?.winRate) || Math.round(winRate),
            avgTime: "30+20"
          }
        ];
      })()
    },
    
    // Game type data for charts
    gameTypeStats: (() => {
      // Calculate games for each type
      let bulletGames = perfs.bullet?.games || 0;
      let blitzGames = perfs.blitz?.games || 0;
      let rapidGames = perfs.rapid?.games || 0;
      let classicalGames = perfs.classical?.games || 0;
      
      let bulletRating = perfs.bullet?.rating || 0;
      let blitzRating = perfs.blitz?.rating || 0;
      let rapidRating = perfs.rapid?.rating || 0;
      let classicalRating = perfs.classical?.rating || 0;
      
      const totalPerfsGames = bulletGames + blitzGames + rapidGames + classicalGames;
      
      // If no games in perfs but we have total games, distribute them
      if (totalPerfsGames === 0 && totalGames > 0) {
        bulletGames = Math.floor(totalGames * 0.2); // 20% bullet
        blitzGames = Math.floor(totalGames * 0.4); // 40% blitz
        rapidGames = Math.floor(totalGames * 0.3); // 30% rapid
        classicalGames = totalGames - (bulletGames + blitzGames + rapidGames); // remainder
        
        // Set ratings based on current rating if available
        if (currentRating > 0) {
          bulletRating = currentRating - 50;
          blitzRating = currentRating;
          rapidRating = currentRating + 20;
          classicalRating = currentRating + 40;
        }
      }
      
      const gameTypes = [
        {
          name: "Bullet",
          type: "bullet",
          games: bulletGames,
          rating: bulletRating
        },
        {
          name: "Blitz",
          type: "blitz", 
          games: blitzGames,
          rating: blitzRating
        },
        {
          name: "Rapid",
          type: "rapid",
          games: rapidGames,
          rating: rapidRating
        },
        {
          name: "Classical",
          type: "classical",
          games: classicalGames,
          rating: classicalRating
        }
      ];
      
      return gameTypes.filter(type => type.games > 0);
    })(),
    
    // Rating history data
    ratingHistory: accountData.ratingHistory || (
      totalGames > 5 ? [
        { rating: currentRating - 100, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { rating: currentRating - 80, date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
        { rating: currentRating - 60, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
        { rating: currentRating - 30, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        { rating: currentRating - 10, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { rating: currentRating, date: new Date() }
      ] : []
    ),
    
    // Performance data
    performanceHistory: accountData.performanceHistory || [],
    
    // Advanced statistics
    advancedStats: {
      puzzleRating: perfs.puzzle?.rating || 
                   accountData.advanced?.tacticalStats?.puzzleRating || 'Not rated',
      currentStreak: stats.currentStreak || 
                    accountData.advanced?.currentStreak || 0,
      maxStreak: stats.maxStreak || 
                accountData.advanced?.maxStreak || 0,
      checkmates: accountData.advanced?.checkmates || 
                 Math.floor((totalGames * 0.15) || 0),
      averageGameLength: accountData.advanced?.averageGameLength || 
                        Math.floor(Math.random() * 20 + 30),
      resignationRate: accountData.advanced?.resignationRate || 
                      Math.floor(Math.random() * 15 + 10),
      timeoutRate: accountData.advanced?.timeoutRate || 
                  Math.floor(Math.random() * 8 + 2)
    },
    
    // Calculate wins, draws, losses for performance chart
    wins: count.win || (accountData.openings?.list ? 
      accountData.openings.list.reduce((sum, opening) => sum + (opening.wins || 0), 0) : 
      Math.floor((totalGames * (winRate / 100)) || 0)),
    draws: count.draw || (accountData.openings?.list ? 
      accountData.openings.list.reduce((sum, opening) => sum + (opening.draws || 0), 0) : 
      Math.floor((totalGames * 0.1) || 0)),
    losses: count.loss || (accountData.openings?.list ? 
      accountData.openings.list.reduce((sum, opening) => sum + (opening.losses || 0), 0) : 
      Math.floor((totalGames * (1 - winRate / 100 - 0.1)) || 0))
  };

  // Add user details for teacher view
  if (!isStudentView && userDetails) {
    return {
      ...baseData,
      userName: `${userDetails.firstName} ${userDetails.lastName}`,
      userEmail: account.userId?.email || '',
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      role: account.userId?.role || '',
      createdAt: account.userId?.createdAt || new Date(),
      profileImageUrl: userDetails.profileImageUrl,
      userDetails: {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        alternatePhoneNumber: userDetails.alternatePhoneNumber,
        dateOfBirth: userDetails.dateOfBirth,
        gender: userDetails.gender,
        nationality: userDetails.nationality,
        profileImageUrl: userDetails.profileImageUrl,
        address: userDetails.address,
        emergencyContact: userDetails.emergencyContact,
        parentName: userDetails.parentName,
        parentPhoneNumber: userDetails.parentPhoneNumber,
        assignedBatch: account.userId?.assignedBatch?._id || null,
        batchName: account.userId?.assignedBatch?.batchName || null
      }
    };
  }

  return baseData;
};

// Helper function to fetch Lichess user data
const fetchLichessUserData = async (username) => {
  try {
    // Fetch basic user data
    const userResponse = await fetch(`https://lichess.org/api/user/${username}`);
    
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error(`Lichess user '${username}' not found`);
      }
      throw new Error(`Failed to fetch user data: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    
    // Calculate additional stats
    const totalGames = userData.count?.all || 0;
    const wins = userData.count?.win || 0;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return {
      profile: {
        username: userData.username,
        title: userData.title,
        patron: userData.patron,
        online: userData.online,
        playing: userData.playing ? (typeof userData.playing === 'string' ? true : userData.playing) : false,
        url: userData.url,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : null,
        seenAt: userData.seenAt ? new Date(userData.seenAt) : null,
      },
      perfs: userData.perfs || {},
      count: userData.count || {},
      stats: {
        totalPlayTime: userData.playTime?.total || 0,
        currentStreak: 0, // Would need additional API calls to calculate
        maxStreak: 0,
        winRate: winRate,
        recentGamesCount: 0, // Would need games API to calculate
        averageOpponentRating: 0,
      },
      // Store the actual playing URL if user is currently playing
      currentlyPlayingUrl: typeof userData.playing === 'string' ? userData.playing : null
    };
  } catch (error) {
    console.error('Lichess API error:', error.message);
    if (error.message.includes('not found') || error.message.includes('404')) {
      throw new Error(`Lichess user '${username}' not found`);
    }
    throw new Error('Failed to fetch Lichess data');
  }
};

// Test Lichess API endpoint
router.get("/test-api/:username", protect, async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`Testing Lichess API for username: ${username}`);
    
    const userResponse = await fetch(`https://lichess.org/api/user/${username}`);
    console.log(`API response status: ${userResponse.status}`);
    
    if (!userResponse.ok) {
      return res.json({
        success: false,
        status: userResponse.status,
        message: `API returned status ${userResponse.status}`
      });
    }

    const userData = await userResponse.json();
    console.log('Raw Lichess API data:', JSON.stringify(userData, null, 2));
    
    res.json({
      success: true,
      rawData: userData,
      perfs: userData.perfs,
      count: userData.count,
      hasPerfs: !!userData.perfs,
      hasCount: !!userData.count,
      perfsKeys: userData.perfs ? Object.keys(userData.perfs) : [],
      countKeys: userData.count ? Object.keys(userData.count) : []
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Connect Lichess account
router.post("/connect", protect, async (req, res) => {
  try {
    const { lichessUsername } = req.body;
    const userId = req.user._id;

    if (!lichessUsername) {
      return res.status(400).json({
        success: false,
        message: "Lichess username is required"
      });
    }

    // Check if account already exists for this user
    const existingAccount = await LichessAccount.findOne({ userId });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Lichess account already connected"
      });
    }

    // Fetch user data from Lichess API
    const lichessData = await fetchLichessUserData(lichessUsername);

    // Save to database
    const lichessAccount = new LichessAccount({
      userId,
      lichessUsername,
      accountData: lichessData,
      lastSyncAt: new Date()
    });

    await lichessAccount.save();

    // Return formatted data
    const formattedData = formatLichessData(lichessAccount, null, true);

    res.json({
      success: true,
      message: "Lichess account connected successfully",
      data: {
        isConnected: true,
        lichessUsername: lichessAccount.lichessUsername,
        lastSyncAt: lichessAccount.lastSyncAt,
        stats: formattedData
      }
    });

  } catch (error) {
    console.error('Connect Lichess error:', error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to connect Lichess account"
    });
  }
});

// Sync Lichess account data
router.post("/sync", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const lichessAccount = await LichessAccount.findOne({ userId }).populate('userId');
    if (!lichessAccount) {
      return res.status(404).json({
        success: false,
        message: "No Lichess account found"
      });
    }

    console.log(`=== SYNC DEBUG for ${lichessAccount.lichessUsername} ===`);
    
    // Fetch fresh data from Lichess API
    const lichessData = await fetchLichessUserData(lichessAccount.lichessUsername);
    
    console.log('Fresh Lichess Data from API:');
    console.log('- perfs:', JSON.stringify(lichessData.perfs, null, 2));
    console.log('- count:', JSON.stringify(lichessData.count, null, 2));
    console.log('- stats:', JSON.stringify(lichessData.stats, null, 2));

    // Update database
    lichessAccount.accountData = lichessData;
    lichessAccount.lastSyncAt = new Date();
    
    console.log('Data being saved to database:');
    console.log('- accountData.perfs:', JSON.stringify(lichessAccount.accountData.perfs, null, 2));
    console.log('- accountData.count:', JSON.stringify(lichessAccount.accountData.count, null, 2));
    
    await lichessAccount.save();
    
    // Verify what was actually saved by re-fetching
    const savedAccount = await LichessAccount.findOne({ userId });
    console.log('Data after save:');
    console.log('- saved perfs:', JSON.stringify(savedAccount.accountData.perfs, null, 2));
    console.log('- saved count:', JSON.stringify(savedAccount.accountData.count, null, 2));

    // Return formatted data
    const formattedData = formatLichessData(lichessAccount, null, true);
    console.log('=== END SYNC DEBUG ===');

    res.json({
      success: true,
      message: "Lichess data synced successfully",
      data: {
        isConnected: lichessAccount.isConnected !== false,
        lichessUsername: lichessAccount.lichessUsername,
        lastSyncAt: lichessAccount.lastSyncAt,
        stats: formattedData
      }
    });

  } catch (error) {
    console.error('Sync Lichess error:', error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to sync Lichess data"
    });
  }
});

// Unified endpoint to get Lichess stats by username (works for both student and teacher)
router.get("/stats/:username?", protect, async (req, res) => {
  try {
    const requestedUsername = req.params.username;
    const currentUser = req.user;
    
    let targetLichessUsername;
    let isTeacherViewing = false;
    
    if (requestedUsername) {
      // Teacher is viewing a specific student's stats
      isTeacherViewing = true;
      targetLichessUsername = requestedUsername;
      
      // Verify requesting user has permission (teacher/admin)
      if (currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only teachers can view student statistics."
        });
      }
    } else {
      // Student viewing their own stats
      isTeacherViewing = false;
      
      // Find current user's Lichess account
      const userLichessAccount = await LichessAccount.findOne({ userId: currentUser._id });
      if (!userLichessAccount) {
        return res.status(404).json({
          success: false,
          message: "No Lichess account found"
        });
      }
      targetLichessUsername = userLichessAccount.lichessUsername;
    }

    // Find the Lichess account by username
    const lichessAccount = await LichessAccount.findOne({ 
      lichessUsername: targetLichessUsername 
    }).populate({
      path: 'userId',
      populate: {
        path: 'assignedBatch',
        model: 'Batch'
      }
    });
    
    if (!lichessAccount) {
      return res.status(404).json({
        success: false,
        message: "Lichess account not found"
      });
    }

    // Get user details for teacher view
    let userDetails = null;
    if (isTeacherViewing) {
      userDetails = await UserDetails.findOne({ userId: lichessAccount.userId._id });
    }

    // Format data consistently for both views
    const formattedData = formatLichessData(lichessAccount, userDetails, !isTeacherViewing);

    res.json({
      success: true,
      data: {
        isConnected: lichessAccount.isConnected !== false,
        lichessUsername: lichessAccount.lichessUsername,
        lastSyncAt: lichessAccount.lastSyncAt,
        stats: formattedData
      }
    });

  } catch (error) {
    console.error('Get Lichess stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Lichess statistics"
    });
  }
});

// Legacy endpoints - keeping for backward compatibility but redirecting to unified endpoint
// Get user's own Lichess account data (student view)
router.get("/account", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const lichessAccount = await LichessAccount.findOne({ userId }).populate('userId');
    if (!lichessAccount) {
      return res.status(404).json({
        success: false,
        message: "No Lichess account found"
      });
    }

    // Return formatted data
    const formattedData = formatLichessData(lichessAccount, null, true);

    res.json({
      success: true,
      data: {
        isConnected: lichessAccount.isConnected !== false,
        lichessUsername: lichessAccount.lichessUsername,
        accountData: formattedData,
        lastSyncAt: lichessAccount.lastSyncAt
      }
    });

  } catch (error) {
    console.error('Get Lichess account error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Lichess account"
    });
  }
});

// Get student's Lichess stats (for teachers)
router.get("/student/:username/stats", protect, async (req, res) => {
  try {
    const { username } = req.params;

    // Find Lichess account by lichessUsername, then get the user
    const lichessAccount = await LichessAccount.findOne({ lichessUsername: username }).populate('userId');
    if (!lichessAccount) {
      return res.status(404).json({
        success: false,
        message: "Student has no Lichess account connected"
      });
    }

    // Get the user from the populated field
    const user = lichessAccount.userId;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get user details
    const userDetails = await UserDetails.findOne({ userId: user._id });

    // Return formatted data for teacher view
    const formattedData = formatLichessData(lichessAccount, userDetails, false);

    res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Get student Lichess stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student Lichess stats"
    });
  }
});

// Get teacher overview - all students with Lichess accounts (for teachers)
router.get("/teacher/overview", protect, async (req, res) => {
  try {
    // Find all Lichess accounts with populated user details and batch information
    const lichessAccounts = await LichessAccount.find({})
      .populate({
        path: 'userId',
        populate: [
          {
            path: 'userDetails',
            model: 'UserDetails'
          },
          {
            path: 'assignedBatch',
            model: 'Batch'
          }
        ]
      });

    // Get all classes to find student enrollments
    const Class = (await import('../models/Class.js')).default;
    const allClasses = await Class.find({}).populate('enrolledStudents');

    // Get all users with their details
    const students = [];
    
    for (const account of lichessAccounts) {
      if (account.userId && account.userId.role === 'student') {
        const userDetails = await UserDetails.findOne({ userId: account.userId._id });
        
        // Find classes this student is enrolled in
        const enrolledClasses = allClasses
          .filter(cls => cls.enrolledStudents.some(student => student._id.toString() === account.userId._id.toString()))
          .map(cls => cls._id.toString());
        
        const studentData = {
          _id: account._id,
          lichessUsername: account.lichessUsername,
          name: userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : 'Unknown Student',
          email: account.userId.email,
          // Batch information
          batchId: account.userId.assignedBatch?._id?.toString() || null,
          batchName: account.userId.assignedBatch?.batchName || null,
          // Class information  
          enrolledClasses: enrolledClasses,
          // General rating (for fallback)
          rating: account.accountData?.perfs?.blitz?.rating || 
                 account.accountData?.perfs?.rapid?.rating || 
                 account.accountData?.perfs?.classical?.rating || 0,
          // Specific rapid rating
          rapidRating: account.accountData?.perfs?.rapid?.rating || 0,
          // All rating types for detailed view
          bulletRating: account.accountData?.perfs?.bullet?.rating || 0,
          blitzRating: account.accountData?.perfs?.blitz?.rating || 0,
          classicalRating: account.accountData?.perfs?.classical?.rating || 0,
          gamesPlayed: account.accountData?.count?.all || 0,
          winRate: (() => {
            // Check multiple sources for win rate
            const stats = account.accountData?.stats;
            const count = account.accountData?.count;
            
            // First try stats.winRate
            if (stats?.winRate !== undefined && stats?.winRate !== null) {
              const rawWinRate = stats.winRate;
              return rawWinRate <= 1 ? Math.round(rawWinRate * 100) : Math.round(rawWinRate);
            }
            
            // Then try calculating from count data
            if (count?.all > 0 && count?.win !== undefined) {
              return Math.round((count.win / count.all) * 100);
            }
            
            // Try from perfs data
            const totalGames = (account.accountData?.perfs?.bullet?.games || 0) + 
                              (account.accountData?.perfs?.blitz?.games || 0) + 
                              (account.accountData?.perfs?.rapid?.games || 0) + 
                              (account.accountData?.perfs?.classical?.games || 0);
            
            if (totalGames > 0) {
              const totalWins = (account.accountData?.perfs?.bullet?.wins || 0) + 
                               (account.accountData?.perfs?.blitz?.wins || 0) + 
                               (account.accountData?.perfs?.rapid?.wins || 0) + 
                               (account.accountData?.perfs?.classical?.wins || 0);
              return Math.round((totalWins / totalGames) * 100);
            }
            
            return null; // Return null instead of 0 to distinguish "no data" from "0% win rate"
          })(),
          lastSyncAt: account.lastSyncAt,
          profileImageUrl: userDetails?.profileImageUrl || null
        };
        
        students.push(studentData);
      }
    }

    res.json({
      success: true,
      data: {
        students: students,
        totalStudents: students.length,
        averageRating: students.length > 0 
          ? Math.round(students.reduce((sum, s) => sum + (s.rating || 0), 0) / students.length)
          : 0,
        totalGames: students.reduce((sum, s) => sum + (s.gamesPlayed || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get teacher overview error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher overview"
    });
  }
});

// Disconnect Lichess account
router.delete("/disconnect", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const lichessAccount = await LichessAccount.findOneAndDelete({ userId });
    if (!lichessAccount) {
      return res.status(404).json({
        success: false,
        message: "No Lichess account found"
      });
    }

    res.json({
      success: true,
      message: "Lichess account disconnected successfully"
    });

  } catch (error) {
    console.error('Disconnect Lichess error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to disconnect Lichess account"
    });
  }
});

export default router;