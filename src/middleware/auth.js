function requireAdminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    res.locals.admin = req.session.admin;
    return next();
  }
  // Remember original target or redirect cleanly
  if (req.originalUrl && !req.originalUrl.includes('/admin/login') && !req.originalUrl.includes('/admin/logout')) {
    req.session.returnTo = req.originalUrl;
  }
  req.flash('error', 'Please log in to access the administration panel.');
  return res.redirect('/admin/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

module.exports = {
  requireAdminAuth,
  redirectIfAuthenticated
};

