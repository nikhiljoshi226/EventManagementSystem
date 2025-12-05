const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile');

router.get('/', async (req, res) => {
  console.log("------------------------------------------");
  console.log("⚠️  Received request for /api/student-profiles");
  
  try {
    // 1. Check DB Connection State
    // 0 = Disconnected, 1 = Connected, 2 = Connecting, 3 = Disconnecting
    const state = mongoose.connection.readyState;
    console.log(`🔌 Database Connection State: ${state}`);
    
    if (state !== 1) {
      throw new Error(`Database is not connected. State code: ${state}`);
    }

    // 2. Attempt Fetch
    console.log("🔍 Querying 'Students' collection in 'test' database...");
    
    // Using .lean() for speed and to avoid strict schema validation issues
    const students = await StudentProfile.find({}).lean();
    
    console.log(`✅ Success! Found ${students.length} documents.`);
    
    // 3. Send Response
    res.json(students);
    
  } catch (error) {
    console.error("❌ CRITICAL SERVER ERROR:", error);
    
    // Send the actual error details to the frontend so you can see it in the Network Tab
    res.status(500).json({ 
      message: 'Internal Server Error', 
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;