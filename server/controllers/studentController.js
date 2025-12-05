const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    console.log('Fetching students...');
    
    // First, check if there are any users in the database
    const totalUsers = await User.countDocuments({});
    console.log(`Total users in database: ${totalUsers}`);
    
    // Find all users with role 'Student' (case-sensitive)
    const students = await User.find({ role: 'Student' })
      .select('-password')
      .sort({ name: 1 })
      .lean()
      .exec();

    console.log(`Found ${students.length} students`);
    
    if (students.length === 0) {
      // Log all users to debug
      const allUsers = await User.find({}).select('name email role').lean();
      console.log('All users in database:', JSON.stringify(allUsers, null, 2));
    }

    // Format the response
    const formattedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      university: student.university || 'Not specified',
      major: student.major || 'Undeclared',
      graduationYear: student.graduationYear || 'N/A',
      skills: student.skills || [],
      interests: student.interests || [],
      linkedIn: student.linkedIn || '',
      resumeUrl: student.resumeUrl || ''
    }));

    res.json({
      success: true,
      count: formattedStudents.length,
      data: formattedStudents
    });
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch students',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
