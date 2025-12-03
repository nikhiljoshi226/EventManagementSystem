const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/cmis_mern_local')
  .then(async () => {
    console.log('MongoDB Connected for Seeding');
    
    // Clear everything
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared all collections');

    // Create 3 Key Users with SIMPLE emails
    const users = await User.insertMany([
      { 
        name: "Alex Student", 
        email: "student@tamu.edu", 
        role: "Student", 
        major: "MIS",
        interests: ["Cybersecurity"],
        password: 'password123' // Will be hashed by pre-save hook
      },
      { 
        name: "Chevron Recruiter", 
        email: "sponsor@tamu.edu", 
        role: "Sponsor", 
        tier: "ExaByte",
        industry: "Energy",
        password: 'password123'
      },
      { 
        name: "Dr. Gomillion", 
        email: "faculty@tamu.edu", 
        role: "Faculty",
        expertise: ["Cloud"],
        password: 'password123'
      }
    ]);

    // Create 1 Event
    const event = await Event.create({
      title: "Cybersecurity Summit",
      date: new Date('2025-12-05'),
      location: "Wehner 113",
      description: "Learn about network security.",
      tags: ["Cybersecurity"],
      status: "Upcoming"
    });

    // Register Alex for the event
    await Registration.create({
      user: users[0]._id,
      event: event._id
    });

    console.log('\n=== Database Reset Complete ===');
    console.log('Use these test accounts to login:');
    console.log('1. student@tamu.edu (Student)');
    console.log('2. sponsor@tamu.edu (Sponsor)');
    console.log('3. faculty@tamu.edu (Faculty)');
    console.log('Password for all: password123\n');
    
    process.exit();
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });