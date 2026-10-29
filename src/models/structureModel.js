const { getDb } = require('../../db/connection');

const SemesterModel = {
  getAll() {
    const db = getDb();
    return db.prepare('SELECT * FROM semesters ORDER BY display_order ASC, name ASC').all();
  },

  getById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM semesters WHERE semester_id = ?').get(id);
  },

  create(name, displayOrder) {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO semesters (name, display_order) VALUES (?, ?)');
    return stmt.run(name, displayOrder || 1);
  },

  update(id, name, displayOrder) {
    const db = getDb();
    const stmt = db.prepare('UPDATE semesters SET name = ?, display_order = ? WHERE semester_id = ?');
    return stmt.run(name, displayOrder || 1, id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM semesters WHERE semester_id = ?').run(id);
  },

  countSubjects(id) {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as count FROM subjects WHERE semester_id = ?').get(id).count;
  }
};

const SubjectModel = {
  getAll() {
    const db = getDb();
    return db.prepare(`
      SELECT s.*, sem.name as semester_name,
        (SELECT COUNT(*) FROM modules m WHERE m.subject_id = s.subject_id) as module_count,
        (SELECT COUNT(*) FROM resources r WHERE r.subject_id = s.subject_id AND r.is_published = 1) as resource_count
      FROM subjects s
      JOIN semesters sem ON s.semester_id = sem.semester_id
      ORDER BY sem.display_order ASC, s.code ASC
    `).all();
  },

  getBySemester(semesterId) {
    const db = getDb();
    return db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM modules m WHERE m.subject_id = s.subject_id) as module_count,
        (SELECT COUNT(*) FROM resources r WHERE r.subject_id = s.subject_id AND r.is_published = 1) as resource_count
      FROM subjects s 
      WHERE s.semester_id = ? 
      ORDER BY s.code ASC
    `).all(semesterId);
  },

  getById(id) {
    const db = getDb();
    return db.prepare(`
      SELECT s.*, sem.name as semester_name 
      FROM subjects s
      JOIN semesters sem ON s.semester_id = sem.semester_id
      WHERE s.subject_id = ?
    `).get(id);
  },

  create(semesterId, code, name, description) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO subjects (semester_id, code, name, description)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(semesterId, code.trim().toUpperCase(), name.trim(), description || '');
  },

  update(id, semesterId, code, name, description) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE subjects 
      SET semester_id = ?, code = ?, name = ?, description = ?
      WHERE subject_id = ?
    `);
    return stmt.run(semesterId, code.trim().toUpperCase(), name.trim(), description || '', id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM subjects WHERE subject_id = ?').run(id);
  },

  countResources(id) {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as count FROM resources WHERE subject_id = ?').get(id).count;
  }
};

const ModuleModel = {
  getBySubject(subjectId) {
    const db = getDb();
    return db.prepare(`
      SELECT m.*,
        (SELECT COUNT(*) FROM resources r WHERE r.module_id = m.module_id AND r.is_published = 1) as resource_count
      FROM modules m 
      WHERE m.subject_id = ? 
      ORDER BY m.module_number ASC
    `).all(subjectId);
  },

  getById(id) {
    const db = getDb();
    return db.prepare(`
      SELECT m.*, s.name as subject_name, s.code as subject_code, s.semester_id, sem.name as semester_name
      FROM modules m
      JOIN subjects s ON m.subject_id = s.subject_id
      JOIN semesters sem ON s.semester_id = sem.semester_id
      WHERE m.module_id = ?
    `).get(id);
  },

  create(subjectId, moduleNumber, title, description) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO modules (subject_id, module_number, title, description)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(subjectId, moduleNumber, title.trim(), description || '');
  },

  update(id, moduleNumber, title, description) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE modules
      SET module_number = ?, title = ?, description = ?
      WHERE module_id = ?
    `);
    return stmt.run(moduleNumber, title.trim(), description || '', id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM modules WHERE module_id = ?').run(id);
  },

  countResources(id) {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as count FROM resources WHERE module_id = ?').get(id).count;
  }
};

module.exports = {
  SemesterModel,
  SubjectModel,
  ModuleModel
};

