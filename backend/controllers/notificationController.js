const User = require('../models/User');

// ✅ GET MY NOTIFICATIONS
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Build query
    let notifications = user.notifications || [];
    
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }
    
    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginated = notifications.slice(startIndex, endIndex);
    
    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Format notifications with time ago
    const formatted = paginated.map(n => ({
      _id: n._id || Date.now() + Math.random(),
      title: n.title,
      message: n.message,
      type: n.type,
      date: n.date,
      read: n.read,
      timeAgo: getTimeAgo(new Date(n.date))
    }));
    
    res.json({
      success: true,
      notifications: formatted,
      unreadCount,
      total: notifications.length,
      page: pageNum,
      pages: Math.ceil(notifications.length / limitNum)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ MARK NOTIFICATION AS READ
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.notifications) {
      user.notifications = [];
    }
    
    // Find and mark notification as read
    const notification = user.notifications.find(n => n._id?.toString() === id || n.id === id);
    if (notification) {
      notification.read = true;
      await user.save();
      
      return res.json({ success: true, message: 'Notification marked as read' });
    }
    
    res.status(404).json({ success: false, message: 'Notification not found' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ MARK ALL AS READ
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.notifications) {
      user.notifications.forEach(n => n.read = true);
      await user.save();
    }
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.notifications) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    const initialLength = user.notifications.length;
    user.notifications = user.notifications.filter(n => n._id?.toString() !== id && n.id !== id);
    
    if (user.notifications.length < initialLength) {
      await user.save();
      return res.json({ success: true, message: 'Notification deleted' });
    }
    
    res.status(404).json({ success: false, message: 'Notification not found' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ CREATE NOTIFICATION (Admin/System use)
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'system', sendEmail = false } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, title and message are required' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.notifications) {
      user.notifications = [];
    }
    
    const notification = {
      _id: Date.now().toString(),
      title,
      message,
      type,
      date: new Date(),
      read: false
    };
    
    user.notifications.unshift(notification); // Add to beginning
    await user.save();
    
    // TODO: Send email if sendEmail = true (requires EMAIL_USER/PASS configured)
    
    res.status(201).json({
      success: true,
      message: 'Notification created',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ✅ GET UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('notifications');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const unreadCount = user.notifications?.filter(n => !n.read).length || 0;
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Helper function for time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
}