const fs = require('fs');
const path = require('path');
const { ResourceModel } = require('../models/resourceModel');

const ResourceService = {
  getAllResources(filter = {}) {
    return ResourceModel.getAll(filter);
  },

  getResourceById(id) {
    const res = ResourceModel.getById(id);
    if (!res) throw new Error('Resource not found');
    return res;
  },

  getResourceTypes() {
    return ResourceModel.getResourceTypes();
  },

  createResource(data, file) {
    if (!file) {
      throw new Error('A document or code file must be selected for upload.');
    }
    if (!data.title || !data.subject_id || !data.type_id) {
      throw new Error('Title, subject, and resource type are required.');
    }

    const fileFormat = path.extname(file.originalname).replace('.', '').toLowerCase();

    return ResourceModel.create({
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      subject_id: parseInt(data.subject_id, 10),
      module_id: data.module_id ? parseInt(data.module_id, 10) : null,
      type_id: parseInt(data.type_id, 10),
      exam_year: data.exam_year ? parseInt(data.exam_year, 10) : null,
      file_path: file.filename, // Store unique random filename
      original_filename: file.originalname,
      file_format: fileFormat,
      file_size: file.size,
      is_published: data.is_published !== undefined ? 1 : 1,
      uploaded_by: data.uploaded_by
    });
  },

  updateResource(id, data, newFile = null) {
    const current = this.getResourceById(id);
    if (!data.title || !data.subject_id || !data.type_id) {
      throw new Error('Title, subject, and resource type are required.');
    }

    ResourceModel.update(id, {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      subject_id: parseInt(data.subject_id, 10),
      module_id: data.module_id ? parseInt(data.module_id, 10) : null,
      type_id: parseInt(data.type_id, 10),
      exam_year: data.exam_year ? parseInt(data.exam_year, 10) : null,
      is_published: data.is_published !== undefined ? parseInt(data.is_published, 10) : 1
    });

    if (newFile) {
      // Remove previous file from disk safely
      const uploadDir = process.env.UPLOAD_DIR 
        ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
        : path.resolve(process.cwd(), 'uploads');
      
      const oldFilePath = path.join(uploadDir, current.file_path);
      if (fs.existsSync(oldFilePath)) {
        try { fs.unlinkSync(oldFilePath); } catch (e) { console.error('Failed to unlink old file:', e); }
      }

      const fileFormat = path.extname(newFile.originalname).replace('.', '').toLowerCase();
      ResourceModel.updateFile(id, newFile.filename, newFile.originalname, fileFormat, newFile.size);
    }
  },

  deleteResource(id) {
    const res = this.getResourceById(id);
    const uploadDir = process.env.UPLOAD_DIR 
      ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
      : path.resolve(process.cwd(), 'uploads');
    
    const filePath = path.join(uploadDir, res.file_path);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error('Failed to remove deleted file from disk:', e); }
    }

    return ResourceModel.delete(id);
  },

  incrementDownloadCount(id) {
    return ResourceModel.incrementDownload(id);
  }
};

module.exports = { ResourceService };

