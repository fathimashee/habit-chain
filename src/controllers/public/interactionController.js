const { validationResult } = require('express-validator');
const { CommunicationService } = require('../../services/communicationService');

const InteractionController = {
  // Announcements Page
  listAnnouncements(req, res) {
    const announcements = CommunicationService.getActiveAnnouncements();
    res.render('public/announcements', {
      pageTitle: 'Official Announcements',
      activeNav: 'announcements',
      announcements
    });
  },

  // Feedback Form
  getFeedback(req, res) {
    res.render('public/feedback', {
      pageTitle: 'Submit Feedback',
      activeNav: 'feedback',
      errors: [],
      formData: {}
    });
  },

  postFeedback(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('public/feedback', {
        pageTitle: 'Submit Feedback',
        activeNav: 'feedback',
        errors: errors.array(),
        formData: req.body
      });
    }

    try {
      const { name, email, category, message, rating } = req.body;
      CommunicationService.createFeedback(name, email, category, message, rating);
      req.flash('success', 'Thank you! Your feedback has been sent to the academic administration.');
      res.redirect('/feedback');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/feedback');
    }
  },

  // Contact Admin Form
  getContact(req, res) {
    res.render('public/contact', {
      pageTitle: 'Contact Administrator',
      activeNav: 'contact',
      errors: [],
      formData: {}
    });
  },

  postContact(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('public/contact', {
        pageTitle: 'Contact Administrator',
        activeNav: 'contact',
        errors: errors.array(),
        formData: req.body
      });
    }

    try {
      const { name, email, subject, message } = req.body;
      CommunicationService.createContactMessage(name, email, subject, message);
      req.flash('success', 'Your message has been delivered to the platform administrator.');
      res.redirect('/contact');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/contact');
    }
  }
};

module.exports = { InteractionController };

