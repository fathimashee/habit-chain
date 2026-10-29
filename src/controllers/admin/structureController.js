const { StructureService } = require('../../services/structureService');
const { getDb } = require('../../../db/connection');

const StructureController = {
  // Dashboard Overview
  getDashboard(req, res) {
    const db = getDb();
    const stats = {
      semesters: db.prepare('SELECT COUNT(*) as count FROM semesters').get().count,
      subjects: db.prepare('SELECT COUNT(*) as count FROM subjects').get().count,
      modules: db.prepare('SELECT COUNT(*) as count FROM modules').get().count,
      resources: db.prepare('SELECT COUNT(*) as count FROM resources').get().count,
      unreadFeedback: db.prepare('SELECT COUNT(*) as count FROM feedback WHERE is_read = 0').get().count,
      unreadContact: db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get().count,
      activeAnnouncements: db.prepare('SELECT COUNT(*) as count FROM announcements WHERE is_active = 1').get().count
    };

    const recentUploads = db.prepare(`
      SELECT r.*, s.name as subject_name, rt.name as type_name
      FROM resources r
      JOIN subjects s ON r.subject_id = s.subject_id
      JOIN resource_types rt ON r.type_id = rt.type_id
      ORDER BY r.uploaded_at DESC
      LIMIT 5
    `).all();

    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard',
      stats,
      recentUploads,
      activeTab: 'dashboard'
    });
  },

  // Semesters
  listSemesters(req, res) {
    const semesters = StructureService.getAllSemesters();
    res.render('admin/semesters/index', {
      pageTitle: 'Manage Semesters',
      semesters,
      activeTab: 'semesters'
    });
  },

  getCreateSemester(req, res) {
    res.render('admin/semesters/form', {
      pageTitle: 'Add Semester',
      semester: {},
      isEdit: false,
      activeTab: 'semesters'
    });
  },

  postCreateSemester(req, res) {
    const { name, display_order } = req.body;
    try {
      StructureService.createSemester(name, display_order);
      req.flash('success', `Semester "${name}" created successfully.`);
      res.redirect('/admin/semesters');
    } catch (err) {
      req.flash('error', err.message);
      res.render('admin/semesters/form', {
        pageTitle: 'Add Semester',
        semester: req.body,
        isEdit: false,
        activeTab: 'semesters'
      });
    }
  },

  getEditSemester(req, res) {
    try {
      const semester = StructureService.getSemester(req.params.id);
      res.render('admin/semesters/form', {
        pageTitle: `Edit ${semester.name}`,
        semester,
        isEdit: true,
        activeTab: 'semesters'
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/semesters');
    }
  },

  postEditSemester(req, res) {
    const { name, display_order } = req.body;
    try {
      StructureService.updateSemester(req.params.id, name, display_order);
      req.flash('success', 'Semester updated successfully.');
      res.redirect('/admin/semesters');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/semesters/${req.params.id}/edit`);
    }
  },

  postDeleteSemester(req, res) {
    try {
      StructureService.deleteSemester(req.params.id);
      req.flash('success', 'Semester deleted successfully.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/semesters');
  },

  // Subjects
  listSubjects(req, res) {
    const subjects = StructureService.getAllSubjects();
    const semesters = StructureService.getAllSemesters();
    res.render('admin/subjects/index', {
      pageTitle: 'Manage Subjects',
      subjects,
      semesters,
      activeTab: 'subjects'
    });
  },

  getCreateSubject(req, res) {
    const semesters = StructureService.getAllSemesters();
    res.render('admin/subjects/form', {
      pageTitle: 'Add Subject',
      subject: {},
      semesters,
      isEdit: false,
      activeTab: 'subjects'
    });
  },

  postCreateSubject(req, res) {
    const { semester_id, code, name, description } = req.body;
    try {
      StructureService.createSubject(semester_id, code, name, description);
      req.flash('success', `Subject "${name}" (${code}) added successfully.`);
      res.redirect('/admin/subjects');
    } catch (err) {
      const semesters = StructureService.getAllSemesters();
      req.flash('error', err.message);
      res.render('admin/subjects/form', {
        pageTitle: 'Add Subject',
        subject: req.body,
        semesters,
        isEdit: false,
        activeTab: 'subjects'
      });
    }
  },

  getEditSubject(req, res) {
    try {
      const subject = StructureService.getSubject(req.params.id);
      const semesters = StructureService.getAllSemesters();
      res.render('admin/subjects/form', {
        pageTitle: `Edit ${subject.name}`,
        subject,
        semesters,
        isEdit: true,
        activeTab: 'subjects'
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/subjects');
    }
  },

  postEditSubject(req, res) {
    const { semester_id, code, name, description } = req.body;
    try {
      StructureService.updateSubject(req.params.id, semester_id, code, name, description);
      req.flash('success', 'Subject updated successfully.');
      res.redirect('/admin/subjects');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/subjects/${req.params.id}/edit`);
    }
  },

  postDeleteSubject(req, res) {
    try {
      StructureService.deleteSubject(req.params.id);
      req.flash('success', 'Subject deleted successfully.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/subjects');
  },

  // Modules
  listModules(req, res) {
    const subjects = StructureService.getAllSubjects();
    const selectedSubjectId = req.query.subject_id || (subjects[0] ? subjects[0].subject_id : null);
    const modules = selectedSubjectId ? StructureService.getModulesBySubject(selectedSubjectId) : [];

    res.render('admin/modules/index', {
      pageTitle: 'Manage Modules',
      subjects,
      selectedSubjectId: parseInt(selectedSubjectId, 10),
      modules,
      activeTab: 'modules'
    });
  },

  getCreateModule(req, res) {
    const subjects = StructureService.getAllSubjects();
    const selectedSubjectId = req.query.subject_id || '';
    res.render('admin/modules/form', {
      pageTitle: 'Add Module',
      moduleItem: { subject_id: selectedSubjectId },
      subjects,
      isEdit: false,
      activeTab: 'modules'
    });
  },

  postCreateModule(req, res) {
    const { subject_id, module_number, title, description } = req.body;
    try {
      StructureService.createModule(subject_id, module_number, title, description);
      req.flash('success', `Module ${module_number}: "${title}" added successfully.`);
      res.redirect(`/admin/modules?subject_id=${subject_id}`);
    } catch (err) {
      const subjects = StructureService.getAllSubjects();
      req.flash('error', err.message);
      res.render('admin/modules/form', {
        pageTitle: 'Add Module',
        moduleItem: req.body,
        subjects,
        isEdit: false,
        activeTab: 'modules'
      });
    }
  },

  getEditModule(req, res) {
    try {
      const moduleItem = StructureService.getModule(req.params.id);
      const subjects = StructureService.getAllSubjects();
      res.render('admin/modules/form', {
        pageTitle: `Edit Module ${moduleItem.module_number}`,
        moduleItem,
        subjects,
        isEdit: true,
        activeTab: 'modules'
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/modules');
    }
  },

  postEditModule(req, res) {
    const { module_number, title, description } = req.body;
    try {
      const current = StructureService.getModule(req.params.id);
      StructureService.updateModule(req.params.id, module_number, title, description);
      req.flash('success', 'Module updated successfully.');
      res.redirect(`/admin/modules?subject_id=${current.subject_id}`);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/modules/${req.params.id}/edit`);
    }
  },

  postDeleteModule(req, res) {
    try {
      const current = StructureService.getModule(req.params.id);
      StructureService.deleteModule(req.params.id);
      req.flash('success', 'Module deleted successfully.');
      res.redirect(`/admin/modules?subject_id=${current.subject_id}`);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/modules');
    }
  }
};

module.exports = { StructureController };

