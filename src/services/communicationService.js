const { AnnouncementModel, FeedbackModel, ContactMessageModel } = require('../models/communicationModel');

const CommunicationService = {
  // Announcements
  getAllAnnouncements() {
    return AnnouncementModel.getAll();
  },

  getActiveAnnouncements() {
    return AnnouncementModel.getActive();
  },

  getAnnouncementById(id) {
    const a = AnnouncementModel.getById(id);
    if (!a) throw new Error('Announcement not found');
    return a;
  },

  createAnnouncement(title, body, expiresAt, createdBy) {
    if (!title || !body) throw new Error('Title and body are required.');
    return AnnouncementModel.create(title, body, expiresAt, createdBy);
  },

  updateAnnouncement(id, title, body, expiresAt, isActive) {
    if (!title || !body) throw new Error('Title and body are required.');
    return AnnouncementModel.update(id, title, body, expiresAt, isActive);
  },

  deleteAnnouncement(id) {
    return AnnouncementModel.delete(id);
  },

  // Feedback
  getAllFeedback() {
    return FeedbackModel.getAll();
  },

  createFeedback(name, email, category, message, rating) {
    if (!name || !email || !message) {
      throw new Error('Name, email, and message are required.');
    }
    return FeedbackModel.create(name, email, category, message, rating);
  },

  markFeedbackRead(id) {
    return FeedbackModel.markRead(id);
  },

  deleteFeedback(id) {
    return FeedbackModel.delete(id);
  },

  // Contact
  getAllContactMessages() {
    return ContactMessageModel.getAll();
  },

  createContactMessage(name, email, subject, message) {
    if (!name || !email || !subject || !message) {
      throw new Error('All contact fields are required.');
    }
    return ContactMessageModel.create(name, email, subject, message);
  },

  markContactRead(id) {
    return ContactMessageModel.markRead(id);
  },

  deleteContactMessage(id) {
    return ContactMessageModel.delete(id);
  }
};

module.exports = { CommunicationService };

