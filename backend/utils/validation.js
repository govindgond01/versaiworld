const { check, validationResult } = require('express-validator');

// User registration validation
const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

// User login validation
const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Payment validation
const validatePayment = [
  check('student', 'Student ID is required').not().isEmpty(),
  check('course', 'Course ID is required').not().isEmpty(),
  check('amount', 'Amount is required').isNumeric(),
  check('paymentMethod', 'Payment method is required').not().isEmpty()
];

// Course validation
const validateCourse = [
  check('code', 'Course code is required').not().isEmpty(),
  check('name', 'Course name is required').not().isEmpty(),
  check('duration', 'Duration is required').isNumeric(),
  check('fees', 'Fees is required').isNumeric()
];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePayment,
  validateCourse,
  validateRequest
};