const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

// 1. GET ALL REGISTRATIONS (For Mentor "Talent Scout" & Sponsor Dashboard)
// No 'protect' middleware here. Just fetch the data.
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name major email linkedIn skills interests resumeUrl') // Get Student Details
      .populate('event', 'title date location'); // Get Event Details
      
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. CREATE REGISTRATION (Student Registering)
router.post('/', async (req, res) => {
  try {
    // We get userId directly from the body (Simple Login style)
    const { userId, eventId } = req.body;
    
    // Validation
    if (!userId || !eventId) {
      return res.status(400).json({ message: 'Missing User ID or Event ID' });
    }

    // Check if already registered
    const exists = await Registration.findOne({ user: userId, event: eventId });
    if (exists) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Create
    const reg = await Registration.create({ 
      user: userId, 
      event: eventId,
      status: 'Registered',
      createdAt: new Date()
    });
    
    res.status(201).json(reg);
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. GET MY REGISTRATIONS (For Student Dashboard)
router.get('/:userId', async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.params.userId })
      .populate('event', 'title date location description');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;