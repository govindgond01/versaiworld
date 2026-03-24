const User = require('../models/User');

//  GET MY SETTINGS
exports.getMySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password -refreshToken -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return settings data
    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        fatherName: user.fatherName,
        dob: user.dob,
        address: user.address
      },
      notifications: user.notificationSettings || {
        email: true,
        push: true,
        sms: false,
        sound: true
      },
      preferences: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY'
      }
    };
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//  UPDATE PROFILE SETTINGS
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, fatherName, dob, address } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (fatherName !== undefined) user.fatherName = fatherName;
    if (dob !== undefined) user.dob = dob;
    if (address !== undefined) user.address = address;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        fatherName: user.fatherName,
        dob: user.dob,
        address: user.address,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//  UPDATE NOTIFICATION SETTINGS
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, sms, sound } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }
    
    if (email !== undefined) user.notificationSettings.email = email;
    if (push !== undefined) user.notificationSettings.push = push;
    if (sms !== undefined) user.notificationSettings.sms = sms;
    if (sound !== undefined) user.notificationSettings.sound = sound;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Notification settings updated',
      settings: user.notificationSettings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//  CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Update password (will be hashed in pre-save hook)
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//  UPDATE PROFILE IMAGE (URL only - Cloudinary upload handled separately)
exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Profile image URL is required' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.profileImage = profileImage;
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile image updated',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//  DELETE ACCOUNT (Admin only or self)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Verify password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password is incorrect' });
    }
    
    // Prevent deleting superAdmin
    if (user.userType === 'superAdmin' && req.user.userType !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Cannot delete super admin' });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};