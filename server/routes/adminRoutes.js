const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats (Admin only)
router.get('/stats', auth, authorize('Admin'), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    // Add more stats as needed
    
    res.json({ userCount, eventCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
router.get('/users', auth, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;