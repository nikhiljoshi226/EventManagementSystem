const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const axios = require('axios');

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events
// @desc    Create an event
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('date', 'Please include a valid date').isISO8601(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newEvent = new Event({
        ...req.body,
        user: req.user.id,
      });

      const event = await newEvent.save();
      res.json(event);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/events/register/:eventId
// @desc    Register for an event
// @access  Private
router.post(
  '/register/:eventId',
  protect,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if already registered
      const existingRegistration = await Registration.findOne({
        user: user._id,
        event: event._id
      });

      if (existingRegistration) {
        return res.status(400).json({ msg: 'Already registered for this event' });
      }

      // Create new registration
      const registration = new Registration({
        user: user._id,
        event: event._id,
        status: 'Registered'
      });

      await registration.save();

      // If user is a mentor, trigger webhook
      if (user.role === 'Mentor') {
        try {
          await axios.post('http://localhost:5678/webhook/mentor-registration', {
            mentorEmail: user.email,
            eventName: event.title,
            ccEmail: 'faculty@tamu.edu'
          });
          console.log('Mentor registration webhook triggered');
        } catch (webhookError) {
          console.error('Mentor registration webhook error:', webhookError.message);
          // Continue even if webhook fails
        }
      }

      res.json({ msg: 'Successfully registered for the event' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/events/registrations/:eventId
// @desc    Get all registrations for an event
// @access  Private/Admin
router.get('/registrations/:eventId', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email role');
    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;