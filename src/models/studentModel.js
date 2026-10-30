const { getDb } = require('../../db/connection');
const { Student } = require('./mongo/schemas');

const StudentModel = {
  async create({ name, email, password_hash, semester_id = null, avatar_color = '#0F9D9A' }) {
    // 1. Sync to MongoDB Atlas
    try {
      await Student.create({
        name,
        email: email.toLowerCase().trim(),
        password_hash,
        avatar_color
      });
    } catch (e) {
      console.warn('[StudentModel-Atlas] Notice:', e.message);
    }

    // 2. Primary local store
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO students (name, email, password_hash, semester_id, avatar_color)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email.toLowerCase().trim(), password_hash, semester_id, avatar_color);
    return result.lastInsertRowid;
  },

  async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    // 1. Try local SQLite
    try {
      const db = getDb();
      const local = db.prepare('SELECT * FROM students WHERE email = ? AND is_active = 1').get(cleanEmail);
      if (local) return local;
    } catch {}

    // 2. Fallback to MongoDB Atlas
    try {
      const doc = await Student.findOne({ email: cleanEmail, is_active: 1 }).lean();
      if (doc) {
        return {
          student_id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          password_hash: doc.password_hash,
          avatar_color: doc.avatar_color,
          is_active: doc.is_active,
          created_at: doc.created_at
        };
      }
    } catch {}

    return null;
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

  async updateLastLogin(id) {
    const db = getDb();
    try {
      db.prepare('UPDATE students SET last_login_at = CURRENT_TIMESTAMP WHERE student_id = ?').run(id);
    } catch {}
  },

  async updateProfile(id, { name, semester_id, avatar_color }) {
    const db = getDb();
    return db.prepare(`
      UPDATE students SET name = ?, semester_id = ?, avatar_color = ? WHERE student_id = ?
    `).run(name, semester_id || null, avatar_color, id);
  },

  async updatePassword(id, password_hash) {
    const db = getDb();
    return db.prepare('UPDATE students SET password_hash = ? WHERE student_id = ?').run(password_hash, id);
  },

  async deactivate(id) {
    const db = getDb();
    return db.prepare('UPDATE students SET is_active = 0 WHERE student_id = ?').run(id);
  }
};

module.exports = { StudentModel };

