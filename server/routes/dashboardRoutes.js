const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Student Dashboard Routes
router.get('/student', 
  protect, 
  authorize(['student']), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Student Dashboard',
      user: req.user
    });
  }
);

// Sponsor Dashboard Routes
router.get('/sponsor', 
  protect, 
  authorize(['sponsor']), 
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Sponsor Dashboard',
      user: req.user
    });
  }
);

module.exports = router;
