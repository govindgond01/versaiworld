const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const fs = require('fs-extra');

// Upload Profile Image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'users/profiles',
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      await fs.remove(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old image from Cloudinary if exists
    if (user.profileImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      } catch (error) {
        console.log('Error deleting old image:', error);
      }
    }

    // Update user with new image
    user.profileImage = {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      uploadedAt: new Date()
    };

    await user.save();

    // Delete temp file
    await fs.remove(req.file.path);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      image: user.profileImage
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file) {
      await fs.remove(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed'
    });
  }
};

// Delete Profile Image
const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.profileImage?.public_id) {
      return res.status(404).json({
        success: false,
        message: 'No profile image found'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(user.profileImage.public_id);

    // Remove from database
    user.profileImage = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage
};