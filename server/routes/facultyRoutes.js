const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all event registrations (for faculty)
router.get('/registrations', protect, authorize(['Faculty', 'faculty']), async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name email')
      .populate('event', 'title date');
    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', protect, authorize(['Faculty', 'faculty']), async (req, res) => {
  try {
    // Get student interests
    const students = await User.find({ role: 'Student' });
    const interests = {};
    
    students.forEach(student => {
      if (student.interests && student.interests.length > 0) {
        student.interests.forEach(interest => {
          interests[interest] = (interests[interest] || 0) + 1;
        });
      }
    });
    
    // Get event registrations count
    const events = await Event.find();
    const eventRegistrations = await Promise.all(
      events.map(async event => {
        const count = await Registration.countDocuments({ event: event._id });
        return {
          event: event.title,
          registrations: count
        };
      })
    );
    
    res.json({
      interests,
      eventRegistrations
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
