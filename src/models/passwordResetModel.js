const { getDb } = require('../../db/connection');
const crypto = require('crypto');

const PasswordResetModel = {
  createToken(student_id) {
    const db = getDb();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
    // Invalidate old tokens first
    db.prepare('DELETE FROM student_password_resets WHERE student_id = ?').run(student_id);
    db.prepare(`
      INSERT INTO student_password_resets (student_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(student_id, tokenHash, expiresAt);
    return rawToken; // send this in the email URL
  },

  findValidToken(rawToken) {
    const db = getDb();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    return db.prepare(`
      SELECT * FROM student_password_resets
      WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
    `).get(tokenHash);
  },

  markUsed(id) {
    const db = getDb();
    return db.prepare('UPDATE student_password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }
};

module.exports = { PasswordResetModel };

