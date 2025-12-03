// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('No user found with email:', email);
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Check password
      console.log('Checking password...');
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        console.log('Password does not match for user:', email);
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Create JWT Payload
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      // Sign JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          console.log('Login successful for user:', user.email);
          res.json({ 
            token,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;