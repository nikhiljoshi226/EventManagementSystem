// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple Login Route
router.post('/login', async (req, res) => {
  const { email } = req.body; // Login using ONLY email for simplicity
  try {
    // Find user by email (Case insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user details needed for the frontend
    res.json({
      _id: user._id,
      name: user.name,
      role: user.role, // "Student", "Sponsor", or "Faculty"
      major: user.major
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;