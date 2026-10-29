const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers/admin/authController');
const { StructureController } = require('../controllers/admin/structureController');
const { ResourceAdminController } = require('../controllers/admin/resourceAdminController');
const { AnnouncementAdminController, InboxAdminController } = require('../controllers/admin/announcementAdminController');
const { requireAdminAuth, redirectIfAuthenticated } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const { csrfProtection } = require('../middleware/csrf');

// Authentication routes (unprotected)
router.get('/login', redirectIfAuthenticated, AuthController.getLogin);
router.post('/login', redirectIfAuthenticated, loginLimiter, AuthController.postLogin);
router.post('/logout', AuthController.postLogout);

// All subsequent /admin routes require authentication
router.use(requireAdminAuth);

// Dashboard
router.get('/dashboard', StructureController.getDashboard);

// Academic Structure (Semesters)
router.get('/semesters', StructureController.listSemesters);
router.get('/semesters/new', StructureController.getCreateSemester);
router.post('/semesters/new', StructureController.postCreateSemester);
router.get('/semesters/:id/edit', StructureController.getEditSemester);
router.post('/semesters/:id/edit', StructureController.postEditSemester);
router.post('/semesters/:id/delete', StructureController.postDeleteSemester);

// Academic Structure (Subjects)
router.get('/subjects', StructureController.listSubjects);
router.get('/subjects/new', StructureController.getCreateSubject);
router.post('/subjects/new', StructureController.postCreateSubject);
router.get('/subjects/:id/edit', StructureController.getEditSubject);
router.post('/subjects/:id/edit', StructureController.postEditSubject);
router.post('/subjects/:id/delete', StructureController.postDeleteSubject);

// Academic Structure (Modules)
router.get('/modules', StructureController.listModules);
router.get('/modules/new', StructureController.getCreateModule);
router.post('/modules/new', StructureController.postCreateModule);
router.get('/modules/:id/edit', StructureController.getEditModule);
router.post('/modules/:id/edit', StructureController.postEditModule);
router.post('/modules/:id/delete', StructureController.postDeleteModule);

// Resource Management: run upload middleware BEFORE csrfProtection so req.body._csrf is populated
router.get('/resources', ResourceAdminController.listResources);
router.get('/resources/new', ResourceAdminController.getCreateResource);
router.post('/resources/new', upload.single('file'), csrfProtection, ResourceAdminController.postCreateResource);
router.get('/resources/:id/edit', ResourceAdminController.getEditResource);
router.post('/resources/:id/edit', upload.single('file'), csrfProtection, ResourceAdminController.postEditResource);
router.post('/resources/:id/delete', ResourceAdminController.postDeleteResource);

// Announcements Management
router.get('/announcements', AnnouncementAdminController.listAnnouncements);
router.get('/announcements/new', AnnouncementAdminController.getCreateAnnouncement);
router.post('/announcements/new', AnnouncementAdminController.postCreateAnnouncement);
router.get('/announcements/:id/edit', AnnouncementAdminController.getEditAnnouncement);
router.post('/announcements/:id/edit', AnnouncementAdminController.postEditAnnouncement);
router.post('/announcements/:id/delete', AnnouncementAdminController.postDeleteAnnouncement);

// Inbox Management (Feedback & Contact)
router.get('/inbox', InboxAdminController.getInbox);
router.post('/inbox/feedback/:id/read', InboxAdminController.postMarkFeedbackRead);
router.post('/inbox/feedback/:id/delete', InboxAdminController.postDeleteFeedback);
router.post('/inbox/contact/:id/read', InboxAdminController.postMarkContactRead);
router.post('/inbox/contact/:id/delete', InboxAdminController.postDeleteContact);

// Dynamic Dropdown Helper API
router.get('/api/subjects/:subjectId/modules', ResourceAdminController.getModulesBySubject);

module.exports = router;
