// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/users
 * @desc    Get users with optional role filter
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    // Fetch users (exclude passwords)
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user details by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email major linkedIn skills resumeUrl role company expertise interests')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      _id: user._id, 
      name: user.name, 
      role: user.role, 
      major: user.major 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all students
// router.get('/students', getStudents);

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    // For demo purposes, we'll return a mock user
    // In a real app, you'd get the user ID from the session/token
    const user = {
      _id: 'demo-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'student',
      major: 'Computer Science',
      resumeUrl: null
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;