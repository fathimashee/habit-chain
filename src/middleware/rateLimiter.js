const rateLimit = require('express-rate-limit');

// Rate limiter for admin login attempts: 5 requests per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  handler: (req, res, next, options) => {
    req.flash('error', options.message);
    res.status(429).redirect('/admin/login');
  }
});

// Rate limiter for public feedback & contact forms to prevent spam
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many submissions from this connection. Please try again later.'
});

// Rate limiter for student login (5 per 15 minutes per IP)
const studentLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash('error', 'Too many login attempts. Please wait 15 minutes and try again.');
    res.status(429).redirect('/login');
  }
});

// Rate limiter for student signup (5 per 15 minutes per IP)
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash('error', 'Too many sign-up attempts. Please wait 15 minutes and try again.');
    res.status(429).redirect('/signup');
  }
});

// Rate limiter for forgot password (5 per 15 minutes per IP)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    req.flash('info', 'If this email is registered, a reset link has been sent.');
    res.redirect('/forgot-password');
  }
});

module.exports = {
  loginLimiter,
  formLimiter,
  studentLoginLimiter,
  signupLimiter,
  forgotPasswordLimiter
};
