function notFoundHandler(req, res, next) {
  res.status(404);
  // Check if JSON requested
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.json({ error: 'Page or resource not found' });
  }
  res.render('public/errors/404', {
    pageTitle: 'Page Not Found',
    path: req.originalUrl,
    user: req.session?.admin || null
  });
}

function errorHandler(err, req, res, next) {
  console.error('Application Error:', err);

  const status = err.status || 500;
  res.status(status);

  // If CSRF token error
  if (err.code === 'EBADCSRFTOKEN') {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(403).json({ error: 'Form session expired or invalid CSRF token. Please refresh and try again.' });
    }
    req.flash?.('error', 'Form session expired. Please try submitting again.');
    return res.redirect(req.get('Referrer') || '/');
  }

  // Multer limit error
  if (err.code === 'LIMIT_FILE_SIZE') {
    req.flash?.('error', `Uploaded file exceeds maximum limit of ${process.env.MAX_FILE_SIZE_MB || 25}MB.`);
    return res.redirect(req.get('Referrer') || '/');
  }

  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.json({ error: err.message || 'An unexpected internal error occurred' });
  }

  res.render('public/errors/500', {
    pageTitle: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.session?.admin || null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};

