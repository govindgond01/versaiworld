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
  renewMembership,
  // Super admin functions
  getAllUsers,
  updateUserRole,
  blockUser,
  deleteUser,
  getAdminStats
} = require('../controllers/adminController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Student Management
router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/active', getActiveStudents);
router.get('/students/expiring', getExpiringStudents);
router.get('/students/types', getStudentTypes); // Deprecated - use /stats instead
router.get('/students/stats', getStudentStats); // ✅ NEW ENDPOINT FOR DASHBOARDS
router.put('/students/:id/renew', renewMembership); // ✅ NEW ROUTE

// Staff Management
router.get('/staff', getAllStaff);
router.post('/staff', addStaff);

// Super Admin Routes (require superAdmin role)
router.use('/users', superAdminOnly);
router.use('/stats', superAdminOnly);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getAdminStats);

module.exports = router;