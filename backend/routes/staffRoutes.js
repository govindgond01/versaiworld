const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ ALL ROUTES REQUIRE AUTHENTICATION
router.use(protect);

// ==========================================
// ✅ STATIC ROUTES - PEHLE (MOST SPECIFIC)
// ==========================================
router.get('/dashboard-stats', adminOnly, staffController.getStaffDashboardStats);
router.get('/stats', adminOnly, staffController.getStaffStats);
router.get('/active', adminOnly, staffController.getActiveStaff);
router.get('/export', adminOnly, staffController.exportStaff);
router.post('/', adminOnly, staffController.createStaff);
router.get('/', adminOnly, staffController.getAllStaff);

// ==========================================
// ✅ DYNAMIC ROUTES - BAAD MEIN (LESS SPECIFIC)
// ==========================================
router.get('/:id', staffController.getStaffById);
router.put('/:id', adminOnly, staffController.updateStaff);
router.delete('/:id', adminOnly, staffController.deleteStaff);
router.patch('/:id/status', adminOnly, staffController.updateStaffStatus);

module.exports = router;