require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cmis_mern_local');

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Dr. G',
      email: 'drg@tamu.edu',
      password: '$2b$10$G.TW8u2d5U3LQ5p0Xr1QqOcJ9vLwKZC2mJ5XxY9zN3vB1aXyZ7A6C', // hashed 'password123'
      role: 'Faculty',
      major: 'MIS'
    });

    const sponsor = await User.create({
      name: 'TechCorp Recruiter',
      email: 'recruiter@techcorp.com',
      password: '$2b$10$G.TW8u2d5U3LQ5p0Xr1QqOcJ9vLwKZC2mJ5XxY9zN3vB1aXyZ7A6C',
      role: 'Admin',
      company: 'TechCorp'
    });

    const student1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@tamu.edu',
      password: '$2b$10$G.TW8u2d5U3LQ5p0Xr1QqOcJ9vLwKZC2mJ5XxY9zN3vB1aXyZ7A6C',
      role: 'Student',
      major: 'MIS',
      interests: 'Cybersecurity, AI, Data Analytics',
      classStanding: 'Senior',
      graduationYear: 2025,
      resumeUrl: '/uploads/resume_alex_2025.pdf'
    });

    const student2 = await User.create({
      name: 'Sarah Williams',
      email: 'sarah@tamu.edu',
      password: '$2b$10$G.TW8u2d5U3LQ5p0Xr1QqOcJ9vLwKZC2mJ5XxY9zN3vB1aXyZ7A6C',
      role: 'Student',
      major: 'Supply Chain Management',
      interests: 'Logistics, Operations, International Business',
      classStanding: 'Junior',
      graduationYear: 2026
    });

    const student3 = await User.create({
      name: 'Mike Chen',
      email: 'mike@tamu.edu',
      password: '$2b$10$G.TW8u2d5U3LQ5p0Xr1QqOcJ9vLwKZC2mJ5XxY9zN3vB1aXyZ7A6C',
      role: 'Student',
      major: 'Marketing',
      interests: 'Digital Marketing, Consumer Behavior',
      classStanding: 'Sophomore',
      graduationYear: 2027
    });

    console.log('Created users');

    // Create events (2, 5, and 10 days from now)
    const today = new Date();
    const event1 = await Event.create({
      title: 'CMIS Case Competition 2025',
      description: 'Annual case competition for MIS students to showcase their problem-solving skills.',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'Wehner 113',
      maxAttendees: 50,
      createdBy: admin._id
    });

    const event2 = await Event.create({
      title: 'TechCorp Networking Night',
      description: 'Exclusive networking event with TechCorp recruiters and professionals.',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      location: 'MSC Ballroom',
      maxAttendees: 100,
      createdBy: admin._id
    });

    const event3 = await Event.create({
      title: 'AI in Business Workshop',
      description: 'Hands-on workshop on implementing AI solutions in business environments.',
      date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      location: 'Wehner 101',
      maxAttendees: 30,
      createdBy: admin._id
    });

    console.log('Created events');

    // Create registrations
    await Registration.create([
      {
        user: student1._id,
        event: event1._id,
        status: 'confirmed',
        registeredAt: new Date()
      },
      {
        user: student1._id,
        event: event2._id,
        status: 'confirmed',
        registeredAt: new Date()
      },
      {
        user: student2._id,
        event: event2._id,
        status: 'confirmed',
        registeredAt: new Date()
      },
      {
        user: student3._id,
        event: event3._id,
        status: 'confirmed',
        registeredAt: new Date()
      }
    ]);

    console.log('Created registrations');
    console.log('\nData Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
db.once('open', () => {
  console.log('Connected to MongoDB');
  seedDatabase();
});
