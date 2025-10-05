# Backend Implementation Required

## Missing API Route: Individual Student Stats

The frontend is trying to call `/lichess/student/:username/stats` but this route doesn't exist in the backend yet.

### Required Backend Implementation

**File:** `backend/routes/lichess.js`

Add this route to handle individual student statistics:

```javascript
// Get individual student stats (for teachers and admins)
router.get('/student/:username/stats', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const { user } = req;

    // Verify user has teacher/admin permissions
    if (user.role !== 'teacher' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher or admin role required.'
      });
    }

    // Find the student by lichess username
    const student = await User.findOne({ 
      lichessUsername: username,
      role: 'student'
    }).populate('userDetails');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's lichess data
    // You might want to fetch fresh data from Lichess API or use cached data
    const studentStats = {
      _id: student._id,
      userName: student.name,
      userEmail: student.email,
      lichessUsername: student.lichessUsername,
      batch: student.userDetails?.batch,
      class: student.userDetails?.class,
      currentRating: student.lichessData?.rating || 0,
      totalGames: student.lichessData?.totalGames || 0,
      winRate: student.lichessData?.winRate || 0,
      peakRating: student.lichessData?.peakRating || student.lichessData?.rating || 0,
      lastSyncAt: student.lichessData?.lastSyncAt,
      
      // Additional data for charts
      ratingHistory: student.lichessData?.ratingHistory || [],
      gameTypes: student.lichessData?.gameTypes || [],
      performanceHistory: student.lichessData?.performanceHistory || [],
      recentGames: student.lichessData?.recentGames || []
    };

    res.json({
      success: true,
      data: studentStats
    });

  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student statistics'
    });
  }
});
```

### Database Schema Updates

You might need to update the User schema to include more detailed Lichess data:

```javascript
// In User.js model, add lichessData field:
lichessData: {
  rating: Number,
  totalGames: Number,
  winRate: Number,
  peakRating: Number,
  lastSyncAt: Date,
  ratingHistory: [{
    date: Date,
    rating: Number
  }],
  gameTypes: [{
    type: String, // blitz, rapid, classical, etc.
    games: Number,
    rating: Number
  }],
  performanceHistory: [{
    date: Date,
    wins: Number,
    losses: Number,
    draws: Number
  }],
  recentGames: [{
    gameId: String,
    opponent: String,
    result: String, // win/loss/draw
    rating: Number,
    date: Date,
    gameType: String
  }]
}
```

### Testing the Route

Once implemented, test with:
```bash
GET http://localhost:5000/api/lichess/student/prathmesh9304/stats
Authorization: Bearer <teacher_token>
```

### Frontend Integration

Once the backend route is ready, uncomment these lines in `LichessIndividualStatPage.jsx`:

```javascript
// Uncomment this when backend route is ready:
const response = await lichessService.getStudentStats(username);
if (response.success) {
  setStudentData(response.data);
} else {
  throw new Error(response.message || "Failed to fetch student data");
}
```

And remove the mock data sections.