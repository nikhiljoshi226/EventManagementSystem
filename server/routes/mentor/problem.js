const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Problem = require('../../models/Problem');
const User = require('../../models/User');

// @route   POST /api/mentor/problems
// @desc    Create a new problem
// @access  Private (Mentor)
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description } = req.body;
    
    // Check if user is a mentor
    const user = await User.findById(req.user.id);
    if (user.role !== 'Mentor') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const newProblem = new Problem({
      title,
      description,
      mentor: req.user.id
    });

    const problem = await newProblem.save();
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/mentor/problems
// @desc    Get all open problems
// @access  Private (Students can view)
router.get('/', auth, async (req, res) => {
  try {
    const problems = await Problem.find({ status: 'Open' })
      .populate('mentor', ['name', 'company']);
    
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
