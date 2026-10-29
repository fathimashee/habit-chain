const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const { csrfProtection } = require('./middleware/csrf');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (required for HTTPS cookie sessions on Render, Railway, Heroku)
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        objectSrc: ["'self'"], // Allows browser PDF embed
        frameSrc: ["'self'"]
      }
    }
  })
);

// Body parsers
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

// Static files (css, js, images) - uploads directory is strictly OUTSIDE this path
app.use(express.static(path.join(__dirname, 'public')));

// EJS setup & layout engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'dev_secret_academic_platform_2026';
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    }
  })
);

// Flash messages
app.use(flash());

// CSRF Protection on non-multipart routes (multipart routes handle upload then csrf)
app.use((req, res, next) => {
  // If multipart upload route for admin resources, defer CSRF check until multer parses body
  if (req.method === 'POST' && (req.path === '/admin/resources/new' || req.path.match(/^\/admin\/resources\/\d+\/edit$/))) {
    // Generate token in session if missing so view can display it
    if (!req.session.csrfToken) {
      const crypto = require('crypto');
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    return next();
  }
  csrfProtection(req, res, next);
});

// Global view variables
app.use((req, res, next) => {
  res.locals.admin = req.session.admin || null;
  res.locals.student = req.session.student || null;
  const msgs = req.flash();
  if (req.query.logout) {
    msgs.success = msgs.success || [];
    msgs.success.push('You have been logged out successfully.');
  }
  res.locals.messages = msgs;
  res.locals.currentPath = req.path;
  next();
});

// Switch layout for /admin routes
app.use('/admin', (req, res, next) => {
  res.locals.layout = 'layouts/admin';
  next();
});

// Mount Routes
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/', studentRoutes);
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
