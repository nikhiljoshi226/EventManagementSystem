const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const SponsorshipRequest = require('./models/SponsorshipRequest');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cmis_cra_local')
  .then(async () => {
    console.log('MongoDB Connected for Seeding');

    // Clear everything
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await SponsorshipRequest.deleteMany({});
    console.log('Cleared all collections');

    // Create Users
    const users = await User.insertMany([
      // Students
      {
        name: "Alex Student",
        email: "abc@bcd.acom",
        role: "Student",
        password: 'password123',
        major: "MIS",
        linkedIn: "https://linkedin.com/in/alex-demo",
        skills: ["Python", "React", "Data Visualization"],
        interests: ["Cybersecurity"],
        approved: true
      },
      {
        name: "Sarah Student",
        email: "sarh@ch.com",
        role: "Student",
        password: 'password123',
        major: "Supply Chain",
        linkedIn: "https://linkedin.com/in/sarah-demo",
        skills: ["SAP", "Excel", "Logistics"],
        interests: ["Energy", "AI"],
        approved: true
      },
      // Mentor
      {
        name: "Mike Mentor",
        email: "mentor@yh.com",
        role: "Mentor",
        password: 'password123',
        company: "Google",
        expertise: ["Cloud Architecture"],
        approved: true
      },
      {
        name: "Nikhil Joshi",
        email: "joshinikhil314@gmail.com",
        role: "Mentor",
        password: 'password123',
        company: "Google",
        expertise: ["React JS"],
        approved: true
      },
      {
        name: "Mihir",
        email: "mihir@mk.du",
        password: "password123",
        role: "Sponsor",
        skills: [],
        interests: [],
        expertise: [],
        approved: true,
        company: 'TEXA',
        date: new Date('2024-03-15'),
      },
      // Faculty
      {
        name: "Dr. Manogna",
        email: "faculty@ch.com",
        role: "Faculty",
        password: 'password123',
        company: "Texas A&M University",
        approved: true
      },
      {
        name: "Dr. Kale",
        email: "mihirkale8@gmail.com",
        role: "Faculty",
        password: 'password123',
        company: "Texas A&M University",
        approved: true
      },
      // Admin
      {
        name: "Admin",
        email: "amcd@op.du",
        role: "Admin",
        password: 'password123',
        company: 'system',
        approved: true
      }
    ]);

    console.log('Created users:', users.map(u => `${u.name} (${u.role})`));

    // Create events
    const events = await Event.insertMany([
      {
        title: 'Cloud Computing Summit',
        description: 'Learn about the latest in cloud technologies',
        date: new Date('2024-03-15'),
        location: 'Zachry Building',
        capacity: 150,
        registrationDeadline: new Date('2024-03-01')
      },
      {
        title: 'Energy Future Panel',
        description: 'Discussion on the future of energy technology',
        date: new Date('2024-04-20'),
        location: 'MSC',
        capacity: 100,
        registrationDeadline: new Date('2024-04-10')
      }
    ]);

    console.log('Created events');

    // Get references to users
    const alex = users.find(u => u.email === 'abc@bcd.acom');
    const sarah = users.find(u => u.email === 'sarh@ch.com');
    const mike = users.find(u => u.email === 'mentor@yh.com');

    // Register students for events
    await Registration.insertMany([
      {
        user: alex._id,
        event: events[0]._id, // Cloud Computing Summit
        status: 'Registered'
      },
      {
        user: sarah._id,
        event: events[0]._id, // Cloud Computing Summit
        status: 'Registered'
      }
    ]);

    console.log('Created registrations');

    // Create a sample sponsorship request
    await SponsorshipRequest.create({
      mentor: mike._id,
      eventTitle: 'Cloud Computing Summit',
      description: 'Sponsorship for student awards and catering',
      caseStudy: 'How Google Cloud is transforming education',
      benefits: ['Brand Exposure', 'Recruitment', 'Thought Leadership'],
      tier: 'PetaByte',
      status: 'Pending'
    });

    console.log('Created sample sponsorship request');

    console.log('\n=== Database Seeded Successfully ===');

    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });