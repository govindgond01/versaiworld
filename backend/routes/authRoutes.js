const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { register, login, getMe, logout, refreshToken, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow more registration attempts for testing
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh-token', authLimiter, refreshToken);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Student profile route - allows students to access their own data
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prepare response based on user type
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType,
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      course: user.course,
      address: user.address,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // Add type-specific fields
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.endDate;
      userResponse.fatherName = user.fatherName;
      userResponse.dob = user.dob;
      
      // Financial info
      userResponse.totalFees = user.financials?.amount || user.fees?.totalFee || 0;
      userResponse.paidFees = user.financials?.paid || user.fees?.paidFee || 0;
      userResponse.dueFees = user.financials?.due || user.fees?.dueFee || 0;
    }
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;