// server/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('event', 'Event ID is required').not().isEmpty(),
      check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
      check('comments', 'Comments are required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { event, rating, comments } = req.body;

      const feedback = new Feedback({
        user: req.user.id,
        event,
        rating,
        comments
      });

      await feedback.save();
      res.status(201).json(feedback);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/feedback/event/:eventId
// @desc    Get feedback for an event
// @access  Public
router.get('/event/:eventId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('user', ['name', 'role'])
      .sort({ date: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/feedback/me
// @desc    Get current user's feedback
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .populate('event', ['title', 'date'])
      .sort({ date: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;