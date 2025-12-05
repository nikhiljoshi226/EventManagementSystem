const mongoose = require('mongoose');

const SponsorshipRequestSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  caseStudy: {
    type: String,
    required: true
  },
  benefits: [{
    type: String,
    required: true
  }],
  tier: {
    type: String,
    enum: ['ExaByte', 'PetaByte', 'TeraByte'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvalDate: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SponsorshipRequest', SponsorshipRequestSchema);
