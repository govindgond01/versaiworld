const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      userId: user.userId,
      studentCategory: user.studentCategory,
      employeesRole: user.employeesRole
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.userType === 'admin' || req.user.userType === 'superAdmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

const employeesOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const allowedRoles = ['admin', 'teacher', 'librarian', 'accountant', 'employees'];
  if (allowedRoles.includes(req.user.userType)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. employees only.'
    });
  }
};

const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.userType === 'student') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Students only.'
    });
  }
};

const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.userType !== 'superAdmin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Super admin only.'
    });
  } else {
    next();
  }
};

module.exports = { protect, adminOnly, employeesOnly, studentOnly, superAdminOnly };