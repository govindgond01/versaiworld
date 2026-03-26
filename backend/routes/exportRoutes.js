const express = require('express');
const router = express.Router();
const { exportData, getCategories } = require('../controllers/exportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// 🔒 ALL ROUTES REQUIRE AUTHENTICATION & ADMIN
router.use(protect);
router.use(adminOnly);

// 📌 Get filter categories (dynamic)
router.get('/categories', getCategories);

// 📌 Export data endpoints
router.post('/:type', exportData); // types: students, employees, payments, courses, attendance

module.exports = router;