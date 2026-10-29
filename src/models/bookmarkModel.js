const { getDb } = require('../../db/connection');

const BookmarkModel = {
  add(student_id, resource_id) {
    const db = getDb();
    try {
      return db.prepare(
        'INSERT OR IGNORE INTO bookmarks (student_id, resource_id) VALUES (?, ?)'
      ).run(student_id, resource_id);
    } catch {
      return null;
    }
  },

  remove(student_id, resource_id) {
    const db = getDb();
    return db.prepare(
      'DELETE FROM bookmarks WHERE student_id = ? AND resource_id = ?'
    ).run(student_id, resource_id);
  },

  isBookmarked(student_id, resource_id) {
    const db = getDb();
    const row = db.prepare(
      'SELECT id FROM bookmarks WHERE student_id = ? AND resource_id = ?'
    ).get(student_id, resource_id);
    return !!row;
  },

  getStudentBookmarks(student_id) {
    const db = getDb();
    return db.prepare(`
      SELECT b.id AS bookmark_id, b.created_at AS bookmarked_at,
             r.resource_id, r.title, r.file_format, r.file_size,
             rt.name AS type_name, rt.slug AS type_slug,
             s.name AS subject_name, s.code AS subject_code,
             sem.name AS semester_name
      FROM bookmarks b
      JOIN resources r ON r.resource_id = b.resource_id AND r.is_published = 1
      JOIN subjects s ON s.subject_id = r.subject_id
      JOIN semesters sem ON sem.semester_id = s.semester_id
      JOIN resource_types rt ON rt.type_id = r.type_id
      WHERE b.student_id = ?
      ORDER BY b.created_at DESC
    `).all(student_id);
  },

  getBookmarkedIds(student_id) {
    const db = getDb();
    const rows = db.prepare('SELECT resource_id FROM bookmarks WHERE student_id = ?').all(student_id);
    return new Set(rows.map(r => r.resource_id));
  }
};

module.exports = { BookmarkModel };

