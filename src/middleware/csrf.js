const crypto = require('crypto');

/**
 * Lightweight, robust double-submit/session CSRF middleware
 */
function csrfProtection(req, res, next) {
  // Ensure session exists
  if (!req.session) {
    return next(new Error('Session middleware required for CSRF protection'));
  }

  // Generate CSRF token in session if not present
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Provide to views automatically
  res.locals.csrfToken = req.session.csrfToken;

  // Safe HTTP methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Check state-changing methods (POST, PUT, DELETE, PATCH)
  // For multipart/form-data, token can come via headers, query string, or parsed body
  const token = (req.body && req.body._csrf) ||
                (req.query && req.query._csrf) ||
                req.headers['csrf-token'] ||
                req.headers['x-csrf-token'] ||
                req.headers['x-xsrf-token'];

  if (!token || token !== req.session.csrfToken) {
    const err = new Error('Invalid or missing CSRF token');
    err.status = 403;
    err.code = 'EBADCSRFTOKEN';
    return next(err);
  }

  next();
}

module.exports = { csrfProtection };
