const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// User notifications
router.get('/my', getMyNotifications);
router.get('/my/unread-count', getUnreadCount);
router.patch('/my/:id/read', markNotificationRead);
router.patch('/my/read-all', markAllNotificationsRead);
router.delete('/my/:id', deleteNotification);

// Admin/System can create notifications for any user
router.post('/', adminOnly, createNotification);

module.exports = router;