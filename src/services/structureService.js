const { SemesterModel, SubjectModel, ModuleModel } = require('../models/structureModel');

const StructureService = {
  // Semester operations
  getAllSemesters() {
    return SemesterModel.getAll();
  },

  getSemester(id) {
    const sem = SemesterModel.getById(id);
    if (!sem) throw new Error('Semester not found');
    return sem;
  },

  createSemester(name, displayOrder) {
    if (!name || name.trim().length === 0) {
      throw new Error('Semester name is required');
    }
    return SemesterModel.create(name.trim(), parseInt(displayOrder, 10) || 1);
  },

  updateSemester(id, name, displayOrder) {
    if (!name || name.trim().length === 0) {
      throw new Error('Semester name is required');
    }
    return SemesterModel.update(id, name.trim(), parseInt(displayOrder, 10) || 1);
  },

  deleteSemester(id) {
    const subjectsCount = SemesterModel.countSubjects(id);
    if (subjectsCount > 0) {
      throw new Error(`Cannot delete semester: it contains ${subjectsCount} subject(s). Please reassign or delete subjects first.`);
    }
    return SemesterModel.delete(id);
  },

  // Subject operations
  getAllSubjects() {
    return SubjectModel.getAll();
  },

  getSubject(id) {
    const sub = SubjectModel.getById(id);
    if (!sub) throw new Error('Subject not found');
    return sub;
  },

  getSubjectsBySemester(semesterId) {
    return SubjectModel.getBySemester(semesterId);
  },

  createSubject(semesterId, code, name, description) {
    if (!semesterId || !code || !name) {
      throw new Error('Semester, subject code, and subject name are required');
    }
    return SubjectModel.create(semesterId, code, name, description);
  },

  updateSubject(id, semesterId, code, name, description) {
    if (!semesterId || !code || !name) {
      throw new Error('Semester, subject code, and subject name are required');
    }
    return SubjectModel.update(id, semesterId, code, name, description);
  },

  deleteSubject(id) {
    const resourceCount = SubjectModel.countResources(id);
    if (resourceCount > 0) {
      throw new Error(`Cannot delete subject: it contains ${resourceCount} active resource(s). Remove resources before deleting this subject.`);
    }
    return SubjectModel.delete(id);
  },

  // Module operations
  getModulesBySubject(subjectId) {
    return ModuleModel.getBySubject(subjectId);
  },

  getModule(id) {
    const mod = ModuleModel.getById(id);
    if (!mod) throw new Error('Module not found');
    return mod;
  },

  createModule(subjectId, moduleNumber, title, description) {
    if (!subjectId || !moduleNumber || !title) {
      throw new Error('Subject, module number, and module title are required');
    }
    return ModuleModel.create(subjectId, parseInt(moduleNumber, 10), title, description);
  },

  updateModule(id, moduleNumber, title, description) {
    if (!moduleNumber || !title) {
      throw new Error('Module number and title are required');
    }
    return ModuleModel.update(id, parseInt(moduleNumber, 10), title, description);
  },

  deleteModule(id) {
    const resourceCount = ModuleModel.countResources(id);
    if (resourceCount > 0) {
      throw new Error(`Cannot delete module: it contains ${resourceCount} active resource(s). Remove or reassign resources first.`);
    }
    return ModuleModel.delete(id);
  }
};

module.exports = { StructureService };

