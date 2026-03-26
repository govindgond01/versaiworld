const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeesController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

//  ALL ROUTES REQUIRE AUTHENTICATION
router.use(protect);

// ==========================================
//  STATIC ROUTES - PEHLE (MOST SPECIFIC)
// ==========================================
router.get('/dashboard-stats', adminOnly, employeesController.getemployeesDashboardStats);
router.get('/stats', adminOnly, employeesController.getemployeesStats);
router.get('/active', adminOnly, employeesController.getActiveemployees);
router.get('/export', adminOnly, employeesController.exportemployees);
router.post('/', adminOnly, employeesController.createemployees);
router.get('/', adminOnly, employeesController.getAllemployees);

// ==========================================
//  DYNAMIC ROUTES - BAAD MEIN (LESS SPECIFIC)
// ==========================================
router.get('/:id', employeesController.getemployeesById);
router.put('/:id', adminOnly, employeesController.updateemployees);
router.delete('/:id', adminOnly, employeesController.deleteemployees);
router.patch('/:id/status', adminOnly, employeesController.updateemployeesStatus);

module.exports = router;