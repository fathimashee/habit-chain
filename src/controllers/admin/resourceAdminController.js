const { ResourceService } = require('../../services/resourceService');
const { StructureService } = require('../../services/structureService');

const ResourceAdminController = {
  listResources(req, res) {
    const filter = {};
    if (req.query.subject_id) filter.subject_id = req.query.subject_id;
    if (req.query.type_id) filter.type_id = req.query.type_id;

    const resources = ResourceService.getAllResources(filter);
    const subjects = StructureService.getAllSubjects();
    const resourceTypes = ResourceService.getResourceTypes();

    res.render('admin/resources/index', {
      pageTitle: 'Manage Resources',
      resources,
      subjects,
      resourceTypes,
      selectedSubjectId: req.query.subject_id || '',
      selectedTypeId: req.query.type_id || '',
      activeTab: 'resources'
    });
  },

  getCreateResource(req, res) {
    const semesters = StructureService.getAllSemesters();
    const subjects = StructureService.getAllSubjects();
    const resourceTypes = ResourceService.getResourceTypes();

    res.render('admin/resources/form', {
      pageTitle: 'Upload Academic Resource',
      resourceItem: {},
      semesters,
      subjects,
      resourceTypes,
      isEdit: false,
      activeTab: 'resources'
    });
  },

  postCreateResource(req, res) {
    try {
      const data = {
        ...req.body,
        uploaded_by: req.session.admin.admin_id
      };
      ResourceService.createResource(data, req.file);
      req.flash('success', `Resource "${data.title}" uploaded successfully.`);
      res.redirect('/admin/resources');
    } catch (err) {
      req.flash('error', err.message);
      const semesters = StructureService.getAllSemesters();
      const subjects = StructureService.getAllSubjects();
      const resourceTypes = ResourceService.getResourceTypes();
      res.render('admin/resources/form', {
        pageTitle: 'Upload Academic Resource',
        resourceItem: req.body,
        semesters,
        subjects,
        resourceTypes,
        isEdit: false,
        activeTab: 'resources'
      });
    }
  },

  getEditResource(req, res) {
    try {
      const resourceItem = ResourceService.getResourceById(req.params.id);
      const semesters = StructureService.getAllSemesters();
      const subjects = StructureService.getAllSubjects();
      const modules = StructureService.getModulesBySubject(resourceItem.subject_id);
      const resourceTypes = ResourceService.getResourceTypes();

      res.render('admin/resources/form', {
        pageTitle: `Edit: ${resourceItem.title}`,
        resourceItem,
        semesters,
        subjects,
        modules,
        resourceTypes,
        isEdit: true,
        activeTab: 'resources'
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/admin/resources');
    }
  },

  postEditResource(req, res) {
    try {
      ResourceService.updateResource(req.params.id, req.body, req.file);
      req.flash('success', 'Resource updated successfully.');
      res.redirect('/admin/resources');
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/admin/resources/${req.params.id}/edit`);
    }
  },

  postDeleteResource(req, res) {
    try {
      ResourceService.deleteResource(req.params.id);
      req.flash('success', 'Resource deleted successfully.');
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/admin/resources');
  },

  // API endpoint for dynamic module dropdown
  getModulesBySubject(req, res) {
    try {
      const modules = StructureService.getModulesBySubject(req.params.subjectId);
      res.json(modules);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = { ResourceAdminController };

