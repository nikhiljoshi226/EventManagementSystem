const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SponsorshipRequest = require('../models/SponsorshipRequest');
const Registration = require('../models/Registration');
const axios = require('axios'); // We use axios directly, not a helper

// n8n Cloud Webhook URL
const N8N_WEBHOOK_URL = 'https://ccgroup6.app.n8n.cloud/webhook-test/fcb9fa3e-ca66-4552-997e-b8d209d40dfa';

// 1. Submit Sponsorship Request
router.post('/sponsorship', async (req, res) => {
  console.log('Received request body:', req.body);
  
  try {
    const { mentorId, eventTitle, description, caseStudy, benefits, tier } = req.body;

    // Validate required fields
    if (!mentorId || !eventTitle || !description || !tier) {
      console.error('Missing required fields:', { mentorId, eventTitle, description, tier });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['mentorId', 'eventTitle', 'description', 'tier'],
        received: Object.keys(req.body)
      });
    }

    // Create DB Entry
    const request = await SponsorshipRequest.create({
      mentor: mentorId,
      eventTitle,
      description,
      caseStudy: caseStudy || 'No case study provided',
      benefits: Array.isArray(benefits) ? benefits : ['No benefits specified'],
      tier,
      status: 'Pending'
    });

    // Fetch Mentor details
    const mentor = await User.findById(mentorId).select('name company email');
    if (!mentor) {
      console.error('Mentor not found:', mentorId);
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Fetch all students and faculty in parallel
    const [students, faculty] = await Promise.all([
      User.find({ role: 'Student' }).select('name email'),
      User.find({ role: 'Faculty' }).select('name email')
    ]);
    
    // Prepare automation payload
    const automationPayload = {
      type: 'SPONSORSHIP_SUBMITTED',
      eventTitle: req.body.eventTitle,
      caseStudy: req.body.caseStudy || 'No case study provided',
      tier: tier,
      mentorName: mentor.name,
      mentorCompany: mentor.company,
      mentorEmail: mentor.email,
      recipients: students.map(student => ({
        name: student.name,
        email: student.email
      })),
      approvers: faculty.map(facultyMember => ({
        name: facultyMember.name,
        email: facultyMember.email
      }))
    };

    // Send to n8n cloud webhook (fire and forget)
    axios.post(N8N_WEBHOOK_URL, automationPayload)
      .catch(err => console.log('n8n Cloud Error (ignoring):', err.message));

    res.json(request);
  } catch (error) {
    console.error('Sponsorship Error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 2. Share Details (Networking Feature)
router.post('/share-details', async (req, res) => {
  try {
    const { mentorId } = req.body;
    
    // Trigger Webhook
    axios.post(N8N_WEBHOOK_URL, {
      type: 'MENTOR_SHARE_PROFILE',
      mentorId,
      timestamp: new Date()
    }).catch(err => console.log('n8n Cloud Webhook failed (ignoring):', err.message));

    res.json({ message: 'Profile shared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. Get Pending Requests (For Faculty)
router.get('/sponsorships', async (req, res) => {
  try {
    // Populate 'mentor' so we see the name in the table
    const requests = await SponsorshipRequest.find({}).populate('mentor', 'name company email');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get registrations for the current mentor
router.get('/registrations', async (req, res) => {
  try {
    // Get user ID from query params
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required',
        example: '/api/mentor/registrations?userId=YOUR_USER_ID'
      });
    }
    
    console.log('Fetching registrations for user:', userId);
    
    // Find registrations where the user field matches the provided userId
    // and populate the event details
    const registrations = await Registration.find({ user: userId })
      .populate('event', 'title date')
      .sort({ createdAt: -1 });
      
    console.log(`Found ${registrations.length} registrations for user ${userId}`);
    
    // If no registrations found, return empty array instead of 404
    // This is a common pattern for list endpoints
    res.json(registrations || []);
      
  } catch (error) {
    console.error('Error in /mentor/registrations:', error);
    res.status(500).json({ 
      message: 'Error fetching registrations',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      // Include the query that caused the error for debugging
      query: { user: req.query.userId }
    });
  }
});

module.exports = router;