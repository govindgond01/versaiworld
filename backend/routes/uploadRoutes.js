const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadProfileImage,
  deleteProfileImage
} = require('../controllers/uploadController');

// Profile image routes
router.post(
  '/profile-image',
  protect,
  upload.single('profileImage'),
  uploadProfileImage
);

router.delete(
  '/profile-image',
  protect,
  deleteProfileImage
);

module.exports = router;