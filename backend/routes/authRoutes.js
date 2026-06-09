const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  registerStudent, registerCompany, registerTrainer,
  login, refreshToken, logout, changePassword, getMe,
  getNotifications, markNotificationsRead
} = require('../controllers/authController');

const passwordValidation = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
];

const emailValidation = body('email').isEmail().normalizeEmail().withMessage('Valid email required');

// Public routes
router.post('/register/student', [
  emailValidation,
  ...passwordValidation,
  body('firstName').notEmpty().trim().withMessage('First name required'),
  body('lastName').notEmpty().trim().withMessage('Last name required'),
  body('branch').notEmpty().withMessage('Branch required'),
  validate
], registerStudent);

router.post('/register/company', [
  emailValidation,
  ...passwordValidation,
  body('companyName').notEmpty().trim().withMessage('Company name required'),
  body('hrName').notEmpty().trim().withMessage('HR name required'),
  validate
], registerCompany);

router.post('/register/trainer', [
  emailValidation,
  ...passwordValidation,
  body('firstName').notEmpty().trim().withMessage('First name required'),
  body('lastName').notEmpty().trim().withMessage('Last name required'),
  validate
], registerTrainer);

router.post('/login', [
  emailValidation,
  body('password').notEmpty().withMessage('Password required'),
  validate
], login);

router.post('/refresh', refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  ...passwordValidation.map(v => body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must have uppercase')
    .matches(/[a-z]/).withMessage('Must have lowercase')
    .matches(/[0-9]/).withMessage('Must have number')),
  validate
], changePassword);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

module.exports = router;
