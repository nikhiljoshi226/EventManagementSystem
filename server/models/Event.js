// server/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    required: true
  }],
  status: {
    type: String,
    enum: ['Upcoming', 'Completed'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ tags: 1 });

module.exports = mongoose.model('Event', eventSchema);