const { StudentModel } = require('../../models/studentModel');
const { BookmarkModel } = require('../../models/bookmarkModel');
const { StudentAuthService } = require('../../services/studentAuthService');
const { StructureService } = require('../../services/structureService');

const StudentDashboardController = {
  // GET /student/dashboard
  getDashboard(req, res) {
    const student = StudentModel.findById(req.session.student.student_id);
    const bookmarks = BookmarkModel.getStudentBookmarks(req.session.student.student_id).slice(0, 4);
    res.render('student/dashboard', {
      pageTitle: 'My Dashboard',
      activeNav: '',
      student,
      bookmarks
    });
  },

  // GET /student/profile
  getProfile(req, res) {
    const student = StudentModel.findById(req.session.student.student_id);
    const semesters = StructureService.getAllSemesters();
    res.render('student/profile', {
      pageTitle: 'My Profile',
      activeNav: '',
      student,
      semesters,
      formData: {}
    });
  },

  // POST /student/profile
  async postProfile(req, res) {
    const student = StudentModel.findById(req.session.student.student_id);
    const semesters = StructureService.getAllSemesters();
    const { name, semester_id, avatar_color } = req.body;

    if (!name || name.trim().length < 2) {
      return res.render('student/profile', {
        pageTitle: 'My Profile',
        activeNav: '',
        student,
        semesters,
        errors: [{ msg: 'Name must be at least 2 characters.' }]
      });
    }

    StudentModel.updateProfile(req.session.student.student_id, {
      name: name.trim(),
      semester_id: semester_id || null,
      avatar_color: avatar_color || '#0F9D9A'
    });

    // Refresh session data
    req.session.student.name = name.trim();
    req.session.student.avatar_color = avatar_color || '#0F9D9A';

    req.flash('success', 'Profile updated successfully.');
    res.redirect('/student/profile');
  },

  // POST /student/change-password
  async postChangePassword(req, res) {
    const { current_password, new_password, confirm_new_password } = req.body;
    const student = StudentModel.findById(req.session.student.student_id);
    const semesters = StructureService.getAllSemesters();

    const currentOk = await StudentAuthService.verifyPassword(current_password, student.password_hash);
    if (!currentOk) {
      return res.render('student/profile', {
        pageTitle: 'My Profile', activeNav: '', student, semesters,
        errors: [{ msg: 'Current password is incorrect.' }]
      });
    }
    if (new_password !== confirm_new_password) {
      return res.render('student/profile', {
        pageTitle: 'My Profile', activeNav: '', student, semesters,
        errors: [{ msg: 'New passwords do not match.' }]
      });
    }
    const check = StudentAuthService.validatePasswordStrength(new_password);
    if (!check.valid) {
      return res.render('student/profile', {
        pageTitle: 'My Profile', activeNav: '', student, semesters,
        errors: [{ msg: check.message }]
      });
    }
    const hash = await StudentAuthService.hashPassword(new_password);
    StudentModel.updatePassword(req.session.student.student_id, hash);
    req.flash('success', 'Password changed successfully.');
    res.redirect('/student/profile');
  },

  // GET /student/bookmarks
  getBookmarks(req, res) {
    const bookmarks = BookmarkModel.getStudentBookmarks(req.session.student.student_id);
    res.render('student/bookmarks', {
      pageTitle: 'My Bookmarks',
      activeNav: '',
      bookmarks
    });
  },

  // POST /student/bookmarks/add
  postAddBookmark(req, res) {
    const { resource_id } = req.body;
    if (!resource_id) return res.status(400).json({ success: false });
    BookmarkModel.add(req.session.student.student_id, parseInt(resource_id));
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, bookmarked: true });
    }
    req.flash('success', 'Resource bookmarked!');
    res.redirect(req.get('Referrer') || '/student/bookmarks');
  },

  // POST /student/bookmarks/remove
  postRemoveBookmark(req, res) {
    const { resource_id } = req.body;
    if (!resource_id) return res.status(400).json({ success: false });
    BookmarkModel.remove(req.session.student.student_id, parseInt(resource_id));
    if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, bookmarked: false });
    }
    req.flash('success', 'Bookmark removed.');
    res.redirect(req.get('Referrer') || '/student/bookmarks');
  }
};

module.exports = { StudentDashboardController };

