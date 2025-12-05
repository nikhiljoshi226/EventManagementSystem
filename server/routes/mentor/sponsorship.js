const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const axios = require('axios');
const SponsorshipRequest = require('../../models/SponsorshipRequest');
const User = require('../../models/User');

// @route   POST /api/mentor/sponsorships
// @desc    Create a new sponsorship request
// @access  Private (Mentor)
router.post('/', [
  auth,
  [
    check('eventTitle', 'Event title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('caseStudy', 'Case study is required').not().isEmpty(),
    check('benefits', 'At least one benefit is required').isArray({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { eventTitle, description, caseStudy, benefits } = req.body;
    
    // Check if user is a mentor
    const mentor = await User.findById(req.user.id);
    if (mentor.role !== 'Mentor') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const newRequest = new SponsorshipRequest({
      mentor: req.user.id,
      eventTitle,
      description,
      caseStudy,
      benefits
    });

    const sponsorship = await newRequest.save();

    // Trigger webhook for email notification
    try {
      await axios.post('https://ccgroup6.app.n8n.cloud/webhook/fcb9fa3e-ca66-4552-997e-b8d209d40dfa', {
        mentorName: mentor.name,
        company: mentor.company,
        eventTitle,
        caseStudy
      });
    } catch (webhookError) {
      console.error('Webhook error:', webhookError.message);
      // Don't fail the request if webhook fails
    }

    res.json(sponsorship);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/mentor/sponsorships
// @desc    Get all pending sponsorship requests
// @access  Private (Faculty)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is faculty or admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'Faculty' && user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const sponsorships = await SponsorshipRequest.find({ status: 'Pending' })
      .populate('mentor', ['name', 'company', 'email']);
    
    res.json(sponsorships);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/mentor/sponsorships/:id/approve
// @desc    Approve a sponsorship request
// @access  Private (Faculty/Admin)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is faculty or admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'Faculty' && user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    let sponsorship = await SponsorshipRequest.findById(req.params.id);
    
    if (!sponsorship) {
      return res.status(404).json({ msg: 'Sponsorship request not found' });
    }

    if (sponsorship.status !== 'Pending') {
      return res.status(400).json({ msg: 'Request already processed' });
    }

    // Update status to approved
    sponsorship.status = 'Approved';
    sponsorship.approvalDate = Date.now();
    
    await sponsorship.save();

    // Get mentor details for the webhook
    const mentor = await User.findById(sponsorship.mentor);

    // Trigger webhook for approval notification
    try {
      await axios.post('http://localhost:5678/webhook/sponsorship-approved', {
        mentorEmail: mentor.email,
        eventTitle: sponsorship.eventTitle
      });
    } catch (webhookError) {
      console.error('Webhook error:', webhookError.message);
      // Don't fail the request if webhook fails
    }

    res.json(sponsorship);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
