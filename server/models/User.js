const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  resumeUrl: String,
    skills: [String],
    interests: [String],
    embedding: {
        type: [Number],
        select: false
    },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Student', 'Faculty', 'Sponsor', 'Admin', 'Mentor'],
    default: 'Student'
  },
  // Student specific fields
  major: {
    type: String,
    required: function() { return this.role === 'Student'; }
  },
  linkedIn: {
    type: String,
    validate: {
      validator: function(v) {
        return this.role !== 'Student' || /^https?:\/\/(www\.)?linkedin\.com\/in\//.test(v);
      },
      message: props => `${props.value} is not a valid LinkedIn URL!`
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  // Mentor specific fields
  company: {
    type: String,
    required: function() { return this.role !== 'Student' || this.role === 'Mentor' || this.role === 'Sponsor'; },
    trim: true
  },
  expertise: [{
    type: String,
    trim: true
  }],
  approved: {
    type: Boolean,
    default: function() { return this.role !== 'Mentor' && this.role !== 'Sponsor'; }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);