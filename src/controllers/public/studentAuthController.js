const { validationResult } = require('express-validator');
const { StudentAuthService } = require('../../services/studentAuthService');
const { AuthService } = require('../../services/authService');
const { EmailService } = require('../../services/emailService');
const { PasswordResetModel } = require('../../models/passwordResetModel');
const { StudentModel } = require('../../models/studentModel');
const { StructureService } = require('../../services/structureService');

const StudentAuthController = {
  // GET /signup
  getSignup(req, res) {
    const semesters = StructureService.getAllSemesters();
    res.render('public/auth/signup', {
      pageTitle: 'Sign Up',
      activeNav: '',
      layout: 'layouts/auth',
      semesters,
      formData: {}
    });
  },

  // POST /signup
  async postSignup(req, res) {
    const semesters = StructureService.getAllSemesters();
    const errors = validationResult(req);
    const formData = {
      name: req.body.name,
      email: req.body.email,
      semester_id: req.body.semester_id
    };

    if (!errors.isEmpty()) {
      return res.render('public/auth/signup', {
        pageTitle: 'Sign Up',
        activeNav: '',
        layout: 'layouts/auth',
        semesters,
        formData,
        errors: errors.array()
      });
    }

    // Honeypot check
    if (req.body.website) {
      return res.redirect('/');
    }

    const { name, email, password, semester_id } = req.body;
    const result = await StudentAuthService.register({ name, email, password, semester_id: semester_id || null });

    if (!result.success) {
      return res.render('public/auth/signup', {
        pageTitle: 'Sign Up',
        activeNav: '',
        layout: 'layouts/auth',
        semesters,
        formData,
        errors: [{ msg: result.message }]
      });
    }

    // Auto-login after registration
    const student = StudentModel.findById(result.studentId);
    req.session.regenerate((err) => {
      if (err) return res.redirect('/login');
      req.session.student = {
        student_id: student.student_id,
        name: student.name,
        email: student.email,
        avatar_color: student.avatar_color,
        semester_name: student.semester_name || null
      };
      req.flash('success', `Welcome to Habit Chain, ${student.name}! Your account has been created.`);
      res.redirect('/student/dashboard');
    });
  },

  // GET /login
  getLogin(req, res) {
    if (req.session && req.session.student) {
      return res.redirect('/student/dashboard');
    }
    const nextUrl = req.query.next || '';
    res.render('public/auth/login', {
      pageTitle: 'Log In',
      activeNav: '',
      layout: 'layouts/auth',
      nextUrl,
      formData: { email: '' }
    });
  },

  // POST /login
  async postLogin(req, res) {
    const errors = validationResult(req);
    const { email, password, remember_me, next: nextUrl } = req.body;

    if (!errors.isEmpty()) {
      return res.render('public/auth/login', {
        pageTitle: 'Log In',
        activeNav: '',
        layout: 'layouts/auth',
        nextUrl: nextUrl || '',
        formData: { email },
        errors: errors.array()
      });
    }

    // 1. Check if user is an Admin
    try {
      const admin = await AuthService.authenticate(email, password);
      if (admin) {
        return req.session.regenerate((err) => {
          if (err) return res.redirect('/login');
          req.session.admin = admin;
          req.flash('success', `Welcome back, ${admin.name}!`);
          return res.redirect('/admin/dashboard');
        });
      }
    } catch (e) {
      // Not admin or auth error, proceed to student check
    }

    // 2. Check if user is a Student
    const result = await StudentAuthService.login(email, password);
    if (!result.success) {
      return res.render('public/auth/login', {
        pageTitle: 'Log In',
        activeNav: '',
        layout: 'layouts/auth',
        nextUrl: nextUrl || '',
        formData: { email },
        errors: [{ msg: 'Invalid email or password.' }]
      });
    }

    // Regenerate session on login (prevents session fixation)
    req.session.regenerate((err) => {
      if (err) return res.redirect('/login');

      req.session.student = {
        student_id: result.student.student_id,
        name: result.student.name,
        email: result.student.email,
        avatar_color: result.student.avatar_color,
        semester_name: result.student.semester_name || null
      };

      // Extend session if "Remember me"
      if (remember_me) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = 2 * 60 * 60 * 1000; // 2 hours
      }

      const safeNext = StudentAuthService.isSafeRedirect(nextUrl) ? nextUrl :
                       StudentAuthService.isSafeRedirect(req.session.returnTo) ? req.session.returnTo :
                       '/student/dashboard';
      delete req.session.returnTo;
      res.redirect(safeNext);
    });
  },

  // POST /logout
  postLogout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      // Use a query-string flag instead of flash (session is gone at this point)
      res.redirect('/?logout=1');
    });
  },

  // GET /forgot-password
  getForgotPassword(req, res) {
    res.render('public/auth/forgot-password', {
      pageTitle: 'Forgot Password',
      activeNav: '',
      layout: 'layouts/auth',
      sent: false
    });
  },

  // POST /forgot-password
  async postForgotPassword(req, res) {
    const { email } = req.body;
    const student = StudentModel.findByEmail(email);
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

    if (student) {
      const rawToken = PasswordResetModel.createToken(student.student_id);
      const resetLink = `${appUrl}/reset-password/${rawToken}`;
      try {
        await EmailService.sendPasswordReset(student.email, student.name, resetLink);
      } catch (e) {
        console.error('Email send error:', e.message);
      }
    }
    // Always show same success message (never reveal whether email exists)
    res.render('public/auth/forgot-password', {
      pageTitle: 'Forgot Password',
      activeNav: '',
      layout: 'layouts/auth',
      sent: true
    });
  },

  // GET /reset-password/:token
  getResetPassword(req, res) {
    const { token } = req.params;
    const record = PasswordResetModel.findValidToken(token);
    if (!record) {
      req.flash('error', 'This reset link is invalid or has expired. Please request a new one.');
      return res.redirect('/forgot-password');
    }
    res.render('public/auth/reset-password', {
      pageTitle: 'Reset Password',
      activeNav: '',
      layout: 'layouts/auth',
      token
    });
  },

  // POST /reset-password/:token
  async postResetPassword(req, res) {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    const record = PasswordResetModel.findValidToken(token);
    if (!record) {
      req.flash('error', 'This reset link is invalid or has expired.');
      return res.redirect('/forgot-password');
    }

    if (password !== confirm_password) {
      return res.render('public/auth/reset-password', {
        pageTitle: 'Reset Password',
        activeNav: '',
        layout: 'layouts/auth',
        token,
        errors: [{ msg: 'Passwords do not match.' }]
      });
    }

    const check = StudentAuthService.validatePasswordStrength(password);
    if (!check.valid) {
      return res.render('public/auth/reset-password', {
        pageTitle: 'Reset Password',
        activeNav: '',
        layout: 'layouts/auth',
        token,
        errors: [{ msg: check.message }]
      });
    }

    const hash = await StudentAuthService.hashPassword(password);
    StudentModel.updatePassword(record.student_id, hash);
    PasswordResetModel.markUsed(record.id);

    req.flash('success', 'Password reset successfully. You can now log in.');
    res.redirect('/login');
  }
};

module.exports = { StudentAuthController };

