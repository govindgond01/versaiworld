const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// ✅ STATIC ROUTES - PEHLE (MOST SPECIFIC)
// ==========================================
router.get('/expiring-soon', protect, adminOnly, studentController.getExpiringStudents);
router.get('/stats', protect, adminOnly, studentController.getStudentStats);
router.get('/active', protect, adminOnly, studentController.getActiveStudents);
router.get('/export', protect, adminOnly, studentController.exportStudents);
router.get('/email/:email', protect, studentController.getStudentByEmail);
router.get('/course/:cource', protect, studentController.getStudentsByCourse);

// ==========================================
// ✅ DYNAMIC ROUTES - BAAD MEIN (LESS SPECIFIC)
// ==========================================
router.get('/:id', protect, studentController.getStudentById);

// ==========================================
// ✅ MUTATION ROUTES
// ==========================================
router.post('/', protect, adminOnly, studentController.createStudent);
router.get('/', protect, adminOnly, studentController.getAllStudents);
router.patch('/:id/renew', protect, adminOnly, studentController.renewMembership);
router.put('/:id', protect, adminOnly, studentController.updateStudent);
router.delete('/:id', protect, adminOnly, studentController.deleteStudent);
router.patch('/:id/status', protect, adminOnly, studentController.updateStudentStatus);

module.exports = router;