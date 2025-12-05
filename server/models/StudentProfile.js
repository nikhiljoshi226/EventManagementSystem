const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  "Student Name": String,
  "UIN": String,
  "emailID": String,
  "Interests": [String],
  "Experience summary": String,
  "Resume pdfs": String,
  "certifications": [String],
  "projects": [{
    "project_name": String,
    "project_description": String,
    "project_link": String
  }]
}, { 
  collection: 'Students', // FORCE it to look at the 'Students' collection
  strict: false // Allow flexibility
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
