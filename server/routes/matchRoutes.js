const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

// @route   POST /api/match/judges
// @desc    Find matching sponsors for event
// @access  Private
router.post('/judges', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const sponsors = await User.find({
      role: 'Sponsor',
      expertise: { $in: event.tags }
    }).select('name email expertise');

    res.json({ 
      event: event.title,
      count: sponsors.length,
      sponsors 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/match/students
// @desc    Find matching students for event
// @access  Private
router.post('/students', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const students = await User.find({
      role: 'Student',
      interests: { $in: event.tags }
    }).select('name email interests');

    res.json({ 
      event: event.title,
      count: students.length,
      students 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;