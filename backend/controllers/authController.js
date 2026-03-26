const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  try {
    console.log('Register request:', req.body);
    
    // Check if user is authenticated and has admin or superAdmin role
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }
    
    const { 
      name, 
      email, 
      password, 
      role,
      userType,
      phone,
      studentCategory,
      employeesRole,
      course
    } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email and password' 
      });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }
    
    const finalUserType = userType || role || 'student';
    const allowedUserTypes = ['admin', 'student', 'employees'];
    
    // Role-based access control for user creation
    if (req.user.userType === 'admin') {
      // Admin can only create students and employees (not other admins)
      if (finalUserType === 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Admin users cannot create other admins. Only super admin can create admins.' 
        });
      }
      // Admin can create students and employees
      if (!['student', 'employees'].includes(finalUserType)) {
        return res.status(403).json({ 
          success: false,
          message: 'Admin can only create students and employees' 
        });
      }
    } else if (req.user.userType !== 'superAdmin') {
      // Only admin and superAdmin can access this endpoint
      return res.status(403).json({ 
        success: false,
        message: 'Only admin and super admin can create users' 
      });
    }
    
    if (!allowedUserTypes.includes(finalUserType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user type' 
      });
    }
    
    if (finalUserType === 'student' && !studentCategory) {
      return res.status(400).json({ 
        success: false,
        message: 'Student category is required for students' 
      });
    }
    
    if (finalUserType === 'employees' && !employeesRole) {
      return res.status(400).json({ 
        success: false,
        message: 'employees role is required for employees' 
      });
    }
    
    const userData = {
      name,
      email,
      phone: phone || '',
      password,
      userType: finalUserType,
      status: 'active',
      isActive: true,
      profileImage: req.body.profileImage || '',
      studentCategory: finalUserType === 'student' ? studentCategory : undefined,
      employeesRole: finalUserType === 'employees' ? employeesRole : undefined
    };
    
    if (finalUserType === 'student' && studentCategory === 'academy') {
      userData.course = course || 'RS CIT';
    } else {
      userData.course = '';
    }
    
    if (finalUserType === 'student') {
      userData.membershipDuration = '1_month';
    }
    
    if (finalUserType === 'employees') {
      userData.salaryType = 'monthly';
    }
    
    const user = await User.create(userData);
    
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    user.refreshToken = refreshToken;
    await user.save();
    
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
      createdAt: user.createdAt
    };
    
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
    }
    
    if (user.userType === 'employees') {
      userResponse.employeesRole = user.employeesRole;
      userResponse.salaryType = user.salaryType;
    }
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });
    
  } catch (error) {
    console.error('Register error:', error);
    
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

exports.login = async (req, res) => {
  try {
    console.log('Login request:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts' 
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000;
      }
      
      await user.save();
      
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.isActive = true;
    
    if (user.status !== 'active' || !user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account is inactive. Please contact administrator.' 
      });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    user.refreshToken = refreshToken;
    await user.save();

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
      createdAt: user.createdAt
    };
    
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.expiryDate;
    }
    
    if (user.userType === 'employees') {
      userResponse.employeesRole = user.employeesRole;
      userResponse.salaryType = user.financials?.salaryType;
    }
    
    if (user.userType === 'admin' || user.userType === 'superAdmin') {
      userResponse.isAdmin = true;
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      token: token,  
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

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
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
    
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.expiryDate;
      userResponse.financials = user.financials || {};
    }
    
    if (user.userType === 'employees') {
      userResponse.employeesRole = user.employeesRole;
      userResponse.salaryType = user.financials?.salaryType;
      userResponse.joinDate = user.joinDate;
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

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default_secret');
    
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    if (!user.isActive || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
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
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

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

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
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
    
    if (user.userType === 'student') {
      userResponse.studentCategory = user.studentCategory;
      userResponse.membershipDuration = user.membershipDuration;
      userResponse.admissionDate = user.admissionDate;
      userResponse.expiryDate = user.endDate;
      userResponse.fatherName = user.fatherName;
      userResponse.dob = user.dob;
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
};