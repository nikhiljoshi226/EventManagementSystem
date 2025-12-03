const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/analytics/interests
// @desc    Get aggregated student interests
// @access  Private
router.get('/interests', auth, async (req, res) => {
  try {
    // Get all students and aggregate their interests
    const students = await User.find({ role: 'Student' }).select('interests');
    
    const interestCounts = students.reduce((acc, student) => {
      if (student.interests && student.interests.length > 0) {
        student.interests.forEach(interest => {
          const normalized = interest.trim().toLowerCase();
          acc[normalized] = (acc[normalized] || 0) + 1;
        });
      }
      return acc;
    }, {});

    // Convert to array and sort by count
    const sortedInterests = Object.entries(interestCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalStudents: students.length,
      uniqueInterests: sortedInterests.length,
      interests: sortedInterests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;