const { getDb } = require('../../db/connection');

const AnnouncementModel = {
  getAll() {
    const db = getDb();
    return db.prepare(`
      SELECT a.*, adm.name as creator_name
      FROM announcements a
      JOIN admins adm ON a.created_by = adm.admin_id
      ORDER BY a.created_at DESC
    `).all();
  },

  getActive() {
    const db = getDb();
    return db.prepare(`
      SELECT a.*, adm.name as creator_name
      FROM announcements a
      JOIN admins adm ON a.created_by = adm.admin_id
      WHERE a.is_active = 1 AND (a.expires_at IS NULL OR a.expires_at > datetime('now'))
      ORDER BY a.created_at DESC
    `).all();
  },

  getById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM announcements WHERE announcement_id = ?').get(id);
  },

  create(title, body, expiresAt, createdBy) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO announcements (title, body, expires_at, created_by, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    return stmt.run(title.trim(), body.trim(), expiresAt || null, createdBy);
  },

  update(id, title, body, expiresAt, isActive) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE announcements
      SET title = ?, body = ?, expires_at = ?, is_active = ?
      WHERE announcement_id = ?
    `);
    return stmt.run(title.trim(), body.trim(), expiresAt || null, isActive ? 1 : 0, id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM announcements WHERE announcement_id = ?').run(id);
  }
};

const FeedbackModel = {
  getAll() {
    const db = getDb();
    return db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
  },

  create(name, email, category, message, rating) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO feedback (name, email, category, message, rating, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    return stmt.run(name.trim(), email.trim(), category, message.trim(), rating ? parseInt(rating, 10) : null);
  },

  markRead(id) {
    const db = getDb();
    return db.prepare('UPDATE feedback SET is_read = 1 WHERE feedback_id = ?').run(id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM feedback WHERE feedback_id = ?').run(id);
  }
};

const ContactMessageModel = {
  getAll() {
    const db = getDb();
    return db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  },

  create(name, email, subject, message) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message, is_read)
      VALUES (?, ?, ?, ?, 0)
    `);
    return stmt.run(name.trim(), email.trim(), subject.trim(), message.trim());
  },

  markRead(id) {
    const db = getDb();
    return db.prepare('UPDATE contact_messages SET is_read = 1 WHERE message_id = ?').run(id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM contact_messages WHERE message_id = ?').run(id);
  }
};

module.exports = {
  AnnouncementModel,
  FeedbackModel,
  ContactMessageModel
};

