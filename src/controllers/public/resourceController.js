const path = require('path');
const fs = require('fs');
const { ResourceService } = require('../../services/resourceService');

const ResourceController = {
  // Controlled file download
  download(req, res, next) {
    try {
      const resource = ResourceService.getResourceById(req.params.id);
      
      const uploadDir = process.env.UPLOAD_DIR 
        ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
        : path.resolve(process.cwd(), 'uploads');
      
      const filePath = path.join(uploadDir, resource.file_path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).render('public/errors/404', {
          pageTitle: 'File Missing',
          message: 'The requested file could not be found on server disk.'
        });
      }

      // Increment metric
      ResourceService.incrementDownloadCount(resource.resource_id);

      // Trigger standard browser file download with preserved original name
      res.download(filePath, resource.original_filename);
    } catch (err) {
      next(err);
    }
  },

  // Raw file stream for in-browser PDF viewing
  stream(req, res, next) {
    try {
      const resource = ResourceService.getResourceById(req.params.id);
      const uploadDir = process.env.UPLOAD_DIR 
        ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
        : path.resolve(process.cwd(), 'uploads');
      
      const filePath = path.join(uploadDir, resource.file_path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resource.original_filename)}"`);
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  // In-browser PDF Viewer page
  view(req, res, next) {
    try {
      const resource = ResourceService.getResourceById(req.params.id);

      if (resource.file_format !== 'pdf') {
        // If not a PDF, redirect directly to download
        return res.redirect(`/resources/${resource.resource_id}/download`);
      }

      res.render('public/viewer', {
        pageTitle: `Preview: ${resource.title}`,
        activeNav: 'semesters',
        resource
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { ResourceController };

