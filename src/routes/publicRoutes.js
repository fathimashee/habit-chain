const express = require('express');
const router = express.Router();
const { BrowseController } = require('../controllers/public/browseController');
const { ResourceController } = require('../controllers/public/resourceController');
const { InteractionController } = require('../controllers/public/interactionController');
const { StructureService } = require('../services/structureService');
const { ResourceService } = require('../services/resourceService');
const { CommunicationService } = require('../services/communicationService');
const { formLimiter } = require('../middleware/rateLimiter');
const { feedbackValidationRules, contactValidationRules } = require('../middleware/formValidator');

// Home Page
router.get('/', (req, res) => {
  const semesters = StructureService.getAllSemesters();
  const announcements = CommunicationService.getActiveAnnouncements().slice(0, 3);
  const recentResources = ResourceService.getAllResources({ is_published: 1 }).slice(0, 6);

  res.render('public/home', {
    pageTitle: 'Home',
    activeNav: 'home',
    semesters,
    announcements,
    recentResources
  });
});

// Hierarchical Browsing (4 clicks or fewer)
router.get('/semesters', BrowseController.listSemesters);
router.get('/semesters/:id', BrowseController.getSemesterDetail);
router.get('/subjects/:id', BrowseController.getSubjectDetail);
router.get('/modules/:id', BrowseController.getModuleDetail);

// Lab & Question Paper Dedicated Sections
router.get('/lab', BrowseController.getLabSection);
router.get('/question-papers', BrowseController.getQuestionPapers);

// Resource Viewing & Downloads
router.get('/resources/:id/download', ResourceController.download);
router.get('/resources/:id/stream', ResourceController.stream);
router.get('/resources/:id/view', ResourceController.view);

// Announcements Dedicated Page
router.get('/announcements', InteractionController.listAnnouncements);

// Feedback & Contact
router.get('/feedback', InteractionController.getFeedback);
router.post('/feedback', formLimiter, feedbackValidationRules, InteractionController.postFeedback);

router.get('/contact', InteractionController.getContact);
router.post('/contact', formLimiter, contactValidationRules, InteractionController.postContact);

module.exports = router;
