const express = require('express');
const router = express.Router();
const { StudentAuthController } = require('../controllers/public/studentAuthController');
const { StudentDashboardController } = require('../controllers/public/studentDashboardController');
const { requireStudent, redirectIfStudent } = require('../middleware/studentAuth');
const { studentLoginLimiter, signupLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

// Validation chains
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email address is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('confirm_password').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
  body('terms').notEmpty().withMessage('You must accept the terms.')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Enter a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

// ─── Auth Routes (no session required) ───────────────────────────────────────
router.get('/signup', redirectIfStudent, StudentAuthController.getSignup);
router.post('/signup', redirectIfStudent, signupLimiter, signupValidation, StudentAuthController.postSignup);

router.get('/login', StudentAuthController.getLogin);
router.post('/login', studentLoginLimiter, loginValidation, StudentAuthController.postLogin);

router.post('/logout', StudentAuthController.postLogout);

router.get('/forgot-password', StudentAuthController.getForgotPassword);
router.post('/forgot-password', forgotPasswordLimiter, StudentAuthController.postForgotPassword);

router.get('/reset-password/:token', StudentAuthController.getResetPassword);
router.post('/reset-password/:token', StudentAuthController.postResetPassword);

// ─── Protected Student Routes ─────────────────────────────────────────────────
router.get('/student/dashboard', requireStudent, StudentDashboardController.getDashboard);
router.get('/student/bookmarks', requireStudent, StudentDashboardController.getBookmarks);
router.post('/student/bookmarks/add', requireStudent, StudentDashboardController.postAddBookmark);
router.post('/student/bookmarks/remove', requireStudent, StudentDashboardController.postRemoveBookmark);
router.get('/student/profile', requireStudent, StudentDashboardController.getProfile);
router.post('/student/profile', requireStudent, StudentDashboardController.postProfile);
router.post('/student/change-password', requireStudent, StudentDashboardController.postChangePassword);

module.exports = router;

