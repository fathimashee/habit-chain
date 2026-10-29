const { getDb } = require('../../db/connection');

const StudentModel = {
  create({ name, email, password_hash, semester_id = null, avatar_color = '#0F9D9A' }) {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO students (name, email, password_hash, semester_id, avatar_color)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email.toLowerCase().trim(), password_hash, semester_id, avatar_color);
    return result.lastInsertRowid;
  },

  findByEmail(email) {
    const db = getDb();
    return db.prepare('SELECT * FROM students WHERE email = ? AND is_active = 1').get(email.toLowerCase().trim());
  },

  findById(id) {
    const db = getDb();
    return db.prepare(`
      SELECT s.*, sem.name AS semester_name
      FROM students s
      LEFT JOIN semesters sem ON sem.semester_id = s.semester_id
      WHERE s.student_id = ? AND s.is_active = 1
    `).get(id);
  },

  updateLastLogin(id) {
    const db = getDb();
    return db.prepare('UPDATE students SET last_login_at = CURRENT_TIMESTAMP WHERE student_id = ?').run(id);
  },

  updateProfile(id, { name, semester_id, avatar_color }) {
    const db = getDb();
    return db.prepare(`
      UPDATE students SET name = ?, semester_id = ?, avatar_color = ? WHERE student_id = ?
    `).run(name, semester_id || null, avatar_color, id);
  },

  updatePassword(id, password_hash) {
    const db = getDb();
    return db.prepare('UPDATE students SET password_hash = ? WHERE student_id = ?').run(password_hash, id);
  },

  deactivate(id) {
    const db = getDb();
    return db.prepare('UPDATE students SET is_active = 0 WHERE student_id = ?').run(id);
  }
};

module.exports = { StudentModel };

