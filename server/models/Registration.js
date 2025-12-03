// server/models/Registration.js
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['Registered', 'Attended', 'Cancelled'],
    default: 'Registered'
  }
}, {
  timestamps: true
});

// Ensure a user can only register once for an event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Indexes for faster queries
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);