const bcrypt = require('bcrypt');
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
  },

  ensureDefaultAdmin() {
    const db = getDb();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const existing = db.prepare('SELECT admin_id, password_hash FROM admins WHERE email = ?').get(adminEmail);
    const newHash = bcrypt.hashSync(adminPassword, 10);

    if (!existing) {
      db.prepare(`
        INSERT INTO admins (name, email, password_hash, role)
        VALUES (?, ?, ?, 'super_admin')
      `).run(adminName, adminEmail, newHash);
      console.log(`[AdminModel] Initialized default admin account: ${adminEmail}`);
    } else {
      // Ensure the hash in the DB always matches the configured ADMIN_PASSWORD
      const matches = bcrypt.compareSync(adminPassword, existing.password_hash);
      if (!matches) {
        db.prepare('UPDATE admins SET password_hash = ?, name = ? WHERE admin_id = ?').run(newHash, adminName, existing.admin_id);
        console.log(`[AdminModel] Synchronized admin password for: ${adminEmail}`);
      }
    }
  }
};

module.exports = { AdminModel };

