const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // For Mongoose 7+, many options are no longer needed
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      // Remove useNewUrlParser and useUnifiedTopology as they are no longer needed in Mongoose 7+
      // useNewUrlParser: true,  // Removed
      // useUnifiedTopology: true // Removed
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection.db;
  } catch (err) {
    console.error('Error connecting to MongoDB:');
    console.error('- Error message:', err.message);
    console.error('- Environment variables:', Object.keys(process.env).filter(k => k.includes('MONGODB')));
    process.exit(1);
  }
};

module.exports = connectDB;