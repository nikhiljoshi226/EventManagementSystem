const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @route   GET /api/registrations
// @desc    Get all registrations (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name email')
      .populate('event', 'title date');
    
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/registrations
// @desc    Register for an event
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('eventId', 'Event ID is required').not().isEmpty(),
      check('eventId', 'Event ID must be a valid ID').isMongoId()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { eventId } = req.body;
      const userId = req.user.id;

      // Check if event exists and is upcoming
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      if (event.status === 'Completed') {
        return res.status(400).json({ message: 'Cannot register for completed events' });
      }

      // Check if already registered
      const existingRegistration = await Registration.findOne({
        user: userId,
        event: eventId
      });

      if (existingRegistration) {
        return res.status(400).json({ 
          message: 'You are already registered for this event',
          registration: existingRegistration
        });
      }

      // Create new registration
      const registration = new Registration({
        user: userId,
        event: eventId,
        status: 'Registered'
      });

      await registration.save();

      // Populate event details in the response
      const populatedReg = await registration
        .populate('event', 'title date location')
        .execPopulate();

      res.status(201).json({
        message: 'Successfully registered for the event',
        registration: populatedReg
      });

    } catch (err) {
      console.error(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/registrations/me
// @desc    Get current user's registrations
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title date location status',
        options: { sort: { date: 1 } }
      })
      .select('-user -__v');

    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id
// @desc    Update registration status
// @access  Private
router.put(
  '/:id',
  [
    protect,
    check('status', 'Status is required')
      .isIn(['Registered', 'Attended', 'Cancelled'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status } = req.body;

      const registration = await Registration.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { status },
        { new: true }
      ).populate('event', 'title date');

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      res.json({
        message: 'Registration updated successfully',
        registration
      });
    } catch (err) {
      console.error(err);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Registration not found' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/registrations/:id
// @desc    Cancel a registration
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;