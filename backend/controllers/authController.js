const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ✅ REGISTER USER
exports.register = async (req, res) => {
  try {
    console.log('Register request:', req.body);
    
    const { 
      name, 
      email, 
      password, 
      role, // This should be 'userType' in your model
      phone,
      studentCategory,
      staffRole,
      course
    } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email and password' 
      });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }
    
    // Validate role/userType
    const allowedUserTypes = ['admin', 'student', 'staff'];
    const userType = role || 'student';
    
    if (!allowedUserTypes.includes(userType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user type' 
      });
    }
    
    // Additional validations based on userType
    if (userType === 'student' && !studentCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Student category is required for students' 
      });
    }
    
    if (userType === 'staff' && !staffRole) {
      return res.status(400).json({ 
        success: false,
        message: 'Staff role is required for staff' 
      });
    }
    
    // Create user data object
    const userData = {
      name,
      email,
      phone: phone || '',
      password,
      userType,
      status: 'active',
      isActive: true,
      profileImage: req.body.profileImage || '',
      studentCategory: userType === 'student' ? studentCategory : undefined,
      staffRole: userType === 'staff' ? staffRole : undefined
    };
    
    // Handle course for academy students
    if (userType === 'student' && studentCategory === 'academy') {
      userData.course = course || 'RS-CIT';  // Default to RS-CIT if not provided
    } else {
      userData.course = '';  // Staff/admin/library student ke liye empty string
    }
    
    // Add specific fields based on userType
    if (userType === 'student') {
      userData.membershipDuration = '1_month';
    }
    
    if (userType === 'staff') {
      userData.salaryType = 'monthly';
    }
    
    const user = await User.create(userData);
    
    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // Prepare response
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role for frontend
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      course: user.course,
      createdAt: user.createdAt
    };
    
    // Add type-specific fields
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
    }
    
    if (user.userType === 'staff') {
      userResponse.staffRole = user.staffRole;
      userResponse.salaryType = user.salaryType;
    }
    
    // Set httpOnly cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (error.keyPattern && error.keyPattern.userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID generation conflict. Please try again.'
        });
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts' 
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 2 hours
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      }
      
      await user.save();
      
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.isActive = true;
    
    // Check if user is active
    if (user.status !== 'active' || !user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is inactive. Please contact administrator.' 
      });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Prepare response
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType, // userType -> role mapping for frontend
      phone: user.phone,
      status: user.status,
      profileImage: user.profileImage,
      course: user.course,
      createdAt: user.createdAt
    };
    
    // Add type-specific fields
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.expiryDate;
    }
    
    if (user.userType === 'staff') {
      userResponse.staffRole = user.staffRole;
      userResponse.salaryType = user.financials?.salaryType;
    }
    
    if (user.userType === 'admin' || user.userType === 'superAdmin') {
      userResponse.isAdmin = true;
    }

    // Set httpOnly cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// ✅ GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Prepare response
    const userResponse = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.userType, // Map userType to role
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
      userResponse.expiryDate = user.expiryDate;
      
      // Financial info for students
      userResponse.financials = user.financials || {};
    }
    
    if (user.userType === 'staff') {
      userResponse.staffRole = user.staffRole;
      userResponse.salaryType = user.financials?.salaryType;
      userResponse.joinDate = user.joinDate;
      
      // Financial info for staff
      userResponse.financials = user.financials || {};
    }
    
    if (user.userType === 'admin') {
      userResponse.isAdmin = true;
    }
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// ✅ LOGOUT (Clear cookies)
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ✅ REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default_secret');
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if user is still active
    if (!user.isActive || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new cookies
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// ✅ FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email template
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Versai Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to reset your password for your Versai Academy account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Versai Academy Team</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: ${resetUrl}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// ✅ RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = password; // Will be hashed by pre-save middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0; // Reset failed login attempts
    user.lockUntil = undefined; // Unlock account if locked
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};