const { CommunicationService } = require('../../services/communicationService');

const AnnouncementAdminController = {
  listAnnouncements(req, res) {
    const announcements = CommunicationService.getAllAnnouncements();
    res.render('admin/announcements/index', {
      pageTitle: 'Manage Announcements',
      announcements,
      activeTab: 'announcements'
    });
  },

  getCreateAnnouncement(req, res) {
    res.render('admin/announcements/form', {
      pageTitle: 'Post Announcement',
      announcement: {},
      isEdit: false,
      activeTab: 'announcements'
    });
  },

  postCreateAnnouncement(req, res) {
    const { title, body, expires_at } = req.body;
    try {
      CommunicationService.createAnnouncement(
        title,
        body,
        expires_at || null,
        req.session.admin.admin_id
      );
      req.flash('success', 'Announcement published.');
      res.redirect('/admin/announcements');
    } catch (err) {
      req.flash('error', err.message);
      res.render('admin/announcements/form', {
        pageTitle: 'Post Announcement',
        announcement: req.body,
        isEdit: false,
        activeTab: 'announcements'
      });
    }
  },

  getEditAnnouncement(req, res) {
    try {
      const announcement = CommunicationService.getAnnouncementById(req.params.id);
      res.render('admin/announcements/form', {
        pageTitle: 'Edit Announcement',
        announcement,
        isEdit: true,
        activeTab: 'announcements'
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/announcements');
    }
  },

  postEditAnnouncement(req, res) {
    const { title, body, expires_at, is_active } = req.body;
    try {
      CommunicationService.updateAnnouncement(
        req.params.id,
        title,
        body,
        expires_at || null,
        is_active !== undefined
      );
      req.flash('success', 'Announcement updated.');
      res.redirect('/admin/announcements');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/announcements/${req.params.id}/edit`);
    }
  },

  postDeleteAnnouncement(req, res) {
    try {
      CommunicationService.deleteAnnouncement(req.params.id);
      req.flash('success', 'Announcement deleted.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/announcements');
  }
};

const InboxAdminController = {
  getInbox(req, res) {
    const feedbackList = CommunicationService.getAllFeedback();
    const contactList = CommunicationService.getAllContactMessages();

    res.render('admin/inbox/index', {
      pageTitle: 'Feedback & Contact Inbox',
      feedbackList,
      contactList,
      activeTab: 'inbox'
    });
  },

  postMarkFeedbackRead(req, res) {
    try {
      CommunicationService.markFeedbackRead(req.params.id);
      req.flash('success', 'Marked feedback as read.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/inbox');
  },

  postDeleteFeedback(req, res) {
    try {
      CommunicationService.deleteFeedback(req.params.id);
      req.flash('success', 'Feedback entry deleted.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/inbox');
  },

  postMarkContactRead(req, res) {
    try {
      CommunicationService.markContactRead(req.params.id);
      req.flash('success', 'Marked message as read.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/inbox');
  },

  postDeleteContact(req, res) {
    try {
      CommunicationService.deleteContactMessage(req.params.id);
      req.flash('success', 'Contact message deleted.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/inbox');
  }
};

module.exports = {
  AnnouncementAdminController,
  InboxAdminController
};

