const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ ALL ROUTES REQUIRE AUTHENTICATION
router.use(protect);

// ==========================================
// ✅ PUBLIC ROUTES - Koi bhi authenticated user
// ==========================================

// 📌 Apni payments dekhna
router.get('/my-payments', paymentController.getMyPayments);

// 📌 Kisi ki payment history (user ID se) - owner ya admin
router.get('/user/:userId', async (req, res) => {
  try {
    // Check if user is accessing their own data or is admin
    if (req.user.id.toString() === req.params.userId || req.user.userType === 'admin') {
      const user = await User.findById(req.params.userId).select('fees financials');
      const payments = user?.fees?.paymentHistory || user?.financials?.paymentHistory || [];
      return res.json({ success: true, payments });
    }
    return res.status(403).json({ success: false, message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📌 Receipt download - owner ya admin
router.get('/receipt/:userId/:paymentId', paymentController.generateReceipt);

// ==========================================
// ✅ ADMIN ONLY ROUTES - Sirf admin
// ==========================================

// 📌 Category wise payments
router.get('/category/:category', adminOnly, paymentController.getPaymentsByCategory);

// 📌 Naya payment add karna (RESTful: POST to collection)
router.post('/', adminOnly, paymentController.addPayment);
// ✅ BACKWARD COMPATIBILITY: Keep old /add endpoint for 6 months
router.post('/add', adminOnly, paymentController.addPayment);

// 📌 Complete payment history with filters
router.get('/history', adminOnly, paymentController.getPaymentHistory);

// 📌 Dashboard summary
router.get('/summary', adminOnly, paymentController.getPaymentSummary);

// 📌 Due payments wale users
router.get('/due-payments', adminOnly, paymentController.getUsersWithDuePayments);

module.exports = router;