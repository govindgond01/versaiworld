const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
//  ALL ROUTES REQUIRE AUTHENTICATION
// ==========================================
router.use(protect);

// ==========================================
//  USER ROUTES - SPECIFIC ROUTES PEHLE
// ==========================================
router.get('/my-all', attendanceController.getMyAllAttendance);
router.get('/my-today', attendanceController.getMyTodayAttendance);
router.get('/my-monthly', attendanceController.getMyMonthlyAttendance);
router.post('/mark', attendanceController.markMyAttendance);

// ==========================================
//  DYNAMIC ROUTES - BAAD MEIN
// ==========================================
router.get('/user/:userId/today', attendanceController.getUserTodayAttendance);
router.get('/user/:userId/monthly', attendanceController.getUserMonthlyAttendance);

// ==========================================
//  ADMIN ROUTES - SABSE LAST MEIN
// ==========================================
router.use(adminOnly);

router.post('/user', attendanceController.markUserAttendance);
router.put('/:attendanceId', attendanceController.updateAttendance);
router.delete('/:attendanceId', attendanceController.deleteAttendance);
router.get('/all', attendanceController.getAllAttendanceByDate);

module.exports = router;