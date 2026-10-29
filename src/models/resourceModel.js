const { getDb } = require('../../db/connection');

const ResourceModel = {
  getAll(filter = {}) {
    const db = getDb();
    let query = `
      SELECT r.*, s.name as subject_name, s.code as subject_code, 
             m.title as module_title, m.module_number,
             rt.name as type_name, rt.slug as type_slug,
             a.name as uploader_name
      FROM resources r
      JOIN subjects s ON r.subject_id = s.subject_id
      LEFT JOIN modules m ON r.module_id = m.module_id
      JOIN resource_types rt ON r.type_id = rt.type_id
      JOIN admins a ON r.uploaded_by = a.admin_id
      WHERE 1=1
    `;
    const params = [];

    if (filter.subject_id) {
      query += ` AND r.subject_id = ?`;
      params.push(filter.subject_id);
    }
    if (filter.module_id) {
      query += ` AND r.module_id = ?`;
      params.push(filter.module_id);
    }
    if (filter.type_id) {
      query += ` AND r.type_id = ?`;
      params.push(filter.type_id);
    }
    if (filter.type_slug) {
      query += ` AND rt.slug = ?`;
      params.push(filter.type_slug);
    }
    if (filter.is_published !== undefined) {
      query += ` AND r.is_published = ?`;
      params.push(filter.is_published);
    }

    query += ` ORDER BY r.uploaded_at DESC`;
    return db.prepare(query).all(...params);
  },

  getById(id) {
    const db = getDb();
    return db.prepare(`
      SELECT r.*, s.name as subject_name, s.code as subject_code, s.semester_id,
             sem.name as semester_name,
             m.title as module_title, m.module_number,
             rt.name as type_name, rt.slug as type_slug,
             a.name as uploader_name
      FROM resources r
      JOIN subjects s ON r.subject_id = s.subject_id
      JOIN semesters sem ON s.semester_id = sem.semester_id
      LEFT JOIN modules m ON r.module_id = m.module_id
      JOIN resource_types rt ON r.type_id = rt.type_id
      JOIN admins a ON r.uploaded_by = a.admin_id
      WHERE r.resource_id = ?
    `).get(id);
  },

  create(data) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO resources (
        title, description, subject_id, module_id, type_id, exam_year,
        file_path, original_filename, file_format, file_size,
        is_published, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.title,
      data.description || null,
      data.subject_id,
      data.module_id || null,
      data.type_id,
      data.exam_year || null,
      data.file_path,
      data.original_filename,
      data.file_format,
      data.file_size,
      data.is_published !== undefined ? data.is_published : 1,
      data.uploaded_by
    );
  },

  update(id, data) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE resources
      SET title = ?, description = ?, subject_id = ?, module_id = ?,
          type_id = ?, exam_year = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE resource_id = ?
    `);
    return stmt.run(
      data.title,
      data.description || null,
      data.subject_id,
      data.module_id || null,
      data.type_id,
      data.exam_year || null,
      data.is_published !== undefined ? data.is_published : 1,
      id
    );
  },

  updateFile(id, filePath, originalFilename, fileFormat, fileSize) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE resources
      SET file_path = ?, original_filename = ?, file_format = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP
      WHERE resource_id = ?
    `);
    return stmt.run(filePath, originalFilename, fileFormat, fileSize, id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM resources WHERE resource_id = ?').run(id);
  },

  incrementDownload(id) {
    const db = getDb();
    return db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE resource_id = ?').run(id);
  },

  getResourceTypes() {
    const db = getDb();
    return db.prepare('SELECT * FROM resource_types ORDER BY type_id ASC').all();
  }
};

module.exports = { ResourceModel };

