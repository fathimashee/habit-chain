const { AuthService } = require('../../services/authService');

const AuthController = {
  getLogin(req, res) {
    res.render('admin/login', {
      pageTitle: 'Admin Login',
      layout: false
    });
  },

  async postLogin(req, res) {
    const { email, password } = req.body;
    try {
      const admin = await AuthService.authenticate(email, password);
      if (!admin) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/admin/login');
      }

      // Store in session with regeneration
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session error:', err);
          return res.redirect('/admin/login');
        }
        req.session.admin = admin;
        req.flash('success', `Welcome back, ${admin.name}!`);

        const returnTo = req.session.returnTo || '/admin/dashboard';
        delete req.session.returnTo;
        res.redirect(returnTo);
      });
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'An error occurred during authentication.');
      res.redirect('/admin/login');
    }
  },

  postLogout(req, res) {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/admin/login');
    });
  }
};

module.exports = { AuthController };

