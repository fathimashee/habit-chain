const bcrypt = require('bcrypt');
const { getDb } = require('../../db/connection');
const { Admin } = require('./mongo/schemas');

const AdminModel = {
  async findByEmail(email) {
    // 1. Try MongoDB Atlas first
    try {
      const doc = await Admin.findOne({ email: email.toLowerCase().trim() }).lean();
      if (doc) {
        return {
          admin_id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          password_hash: doc.password_hash,
          role: doc.role,
          created_at: doc.created_at
        };
      }
    } catch (e) {
      // Fallback to SQLite if Atlas query fails
    }

    // 2. Fallback to SQLite
    try {
      const db = getDb();
      return db.prepare('SELECT * FROM admins WHERE email = ?').get(email.toLowerCase().trim());
    } catch {
      return null;
    }
  },

  async findById(id) {
    try {
      const doc = await Admin.findById(id).lean();
      if (doc) {
        return {
          admin_id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          role: doc.role,
          created_at: doc.created_at
        };
      }
    } catch {}

    try {
      const db = getDb();
      return db.prepare('SELECT admin_id, name, email, role, created_at FROM admins WHERE admin_id = ?').get(id);
    } catch {
      return null;
    }
  },

  async updatePassword(id, passwordHash) {
    try {
      await Admin.findByIdAndUpdate(id, { password_hash: passwordHash });
    } catch {}

    try {
      const db = getDb();
      return db.prepare('UPDATE admins SET password_hash = ? WHERE admin_id = ?').run(passwordHash, id);
    } catch {}
  },

  async ensureDefaultAdmin() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';
    const newHash = bcrypt.hashSync(adminPassword, 10);

    // MongoDB Atlas sync
    try {
      const existingMongo = await Admin.findOne({ email: adminEmail });
      if (!existingMongo) {
        await Admin.create({
          name: adminName,
          email: adminEmail,
          password_hash: newHash,
          role: 'super_admin'
        });
        console.log(`[AdminModel-Atlas] Initialized default admin: ${adminEmail}`);
      } else {
        const matches = bcrypt.compareSync(adminPassword, existingMongo.password_hash);
        if (!matches) {
          existingMongo.password_hash = newHash;
          existingMongo.name = adminName;
          await existingMongo.save();
          console.log(`[AdminModel-Atlas] Synchronized password for: ${adminEmail}`);
        }
      }
    } catch (err) {
      console.warn('[AdminModel-Atlas] Sync notice:', err.message);
    }

    // SQLite local sync
    try {
      const db = getDb();
      const existing = db.prepare('SELECT admin_id, password_hash FROM admins WHERE email = ?').get(adminEmail);
      if (!existing) {
        db.prepare(`
          INSERT INTO admins (name, email, password_hash, role)
          VALUES (?, ?, ?, 'super_admin')
        `).run(adminName, adminEmail, newHash);
      } else {
        const matches = bcrypt.compareSync(adminPassword, existing.password_hash);
        if (!matches) {
          db.prepare('UPDATE admins SET password_hash = ?, name = ? WHERE admin_id = ?').run(newHash, adminName, existing.admin_id);
        }
      }
    } catch {}
  }
};

module.exports = { AdminModel };

