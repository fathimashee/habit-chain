/**
 * Student authentication middleware
 * Completely separate from admin session (req.session.admin)
 */

function requireStudent(req, res, next) {
  if (req.session && req.session.student) {
    res.locals.student = req.session.student;
    return next();
  }
  // Save the intended destination for post-login redirect
  const next_url = req.originalUrl;
  if (next_url && next_url !== '/login' && next_url !== '/signup') {
    req.session.returnTo = next_url;
  }
  req.flash('error', 'Please log in to access this page.');
  return res.redirect('/login');
}

function redirectIfStudent(req, res, next) {
  if (req.session && req.session.student) {
    return res.redirect('/student/dashboard');
  }
  next();
}

// Students must NEVER be able to reach /admin routes
// (Admin middleware already handles this, but this is an extra guard)
function blockStudentFromAdmin(req, res, next) {
  if (req.session && req.session.student && !req.session.admin) {
    return res.status(403).render('public/errors/403', {
      pageTitle: 'Access Denied',
      message: 'You do not have permission to access this area.'
    });
  }
  next();
}

module.exports = { requireStudent, redirectIfStudent, blockStudentFromAdmin };

