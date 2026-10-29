const { getDb } = require('../../db/connection');

const AdminModel = {
  findByEmail(email) {
    const db = getDb();
    return db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT admin_id, name, email, role, created_at FROM admins WHERE admin_id = ?').get(id);
  },

  updatePassword(id, passwordHash) {
    const db = getDb();
    return db.prepare('UPDATE admins SET password_hash = ? WHERE admin_id = ?').run(passwordHash, id);
  }
};

module.exports = { AdminModel };

