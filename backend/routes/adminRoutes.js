const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  getActiveStudents,
  getExpiringStudents,
  getStudentTypes,
  getAllStaff,
  addStaff,
  renewMembership
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { protect, adminOnly } = require('../middleware/authMiddleware');
router.use(protect);
router.use(adminOnly);

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Student Management
router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/active', getActiveStudents);
router.get('/students/expiring', getExpiringStudents);
router.get('/students/types', getStudentTypes);
router.put('/students/:id/renew', renewMembership); // ✅ NEW ROUTE

// Staff Management
router.get('/staff', getAllStaff);
router.post('/staff', addStaff);

module.exports = router;