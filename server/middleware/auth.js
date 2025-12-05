// server/middleware/auth.js
const User = require('../models/User');

// Simple authentication middleware for demo purposes
const protect = async (req, res, next) => {
  try {
    // Get user ID and role from headers
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-demo-role'];
    
    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Missing authentication headers' });
    }
    
    // For demo purposes, we'll create a simple user object
    // In a real app, you would verify the user exists in the database
    req.user = {
      id: userId,
      role: userRole.toLowerCase() // Ensure role is lowercase for consistency
    };
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user' });
    }
    
    // Flatten the roles array in case nested arrays are passed
    const allowedRoles = [].concat(...roles).map(role => role?.toLowerCase?.());
    const userRole = req.user.role?.toLowerCase?.();
    
    // If no roles are specified or user's role is in the allowed roles, allow access
    if (roles.length === 0 || allowedRoles.includes(userRole)) {
      return next();
    }
    
    // If user is not authorized
    return res.status(403).json({
      success: false,
      error: `User role ${req.user.role} is not authorized to access this route`
    });
  };
};

module.exports = { protect, authorize };