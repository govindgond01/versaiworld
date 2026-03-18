const express = require('express');
const router = express.Router();
const {
  getMySettings,
  updateProfile,
  updateNotificationSettings,
  changePassword,
  updateProfileImage,
  deleteAccount
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Settings routes
router.get('/', getMySettings);
router.put('/profile', updateProfile);
router.put('/notifications', updateNotificationSettings);
router.put('/password', changePassword);
router.put('/profile-image', updateProfileImage);
router.delete('/account', deleteAccount);

module.exports = router;