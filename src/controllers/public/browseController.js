const { StructureService } = require('../../services/structureService');
const { ResourceService } = require('../../services/resourceService');
const { getDb } = require('../../../db/connection');

const BrowseController = {
  // Click 1: Semesters List (/semesters)
  listSemesters(req, res) {
    const semesters = StructureService.getAllSemesters();
    res.render('public/semesters', {
      pageTitle: 'Course Semesters',
      activeNav: 'semesters',
      semesters
    });
  },

  // Click 2: Semester Detail -> Subjects (/semesters/:id)
  getSemesterDetail(req, res) {
    try {
      const semester = StructureService.getSemester(req.params.id);
      const subjects = StructureService.getSubjectsBySemester(req.params.id);

      res.render('public/semester-detail', {
        pageTitle: `${semester.name} - Subjects`,
        activeNav: 'semesters',
        semester,
        subjects
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/semesters');
    }
  },

  // Click 3: Subject Detail -> Modules & Subject Resources (/subjects/:id)
  getSubjectDetail(req, res) {
    try {
      const subject = StructureService.getSubject(req.params.id);
      const semester = StructureService.getSemester(subject.semester_id);
      const modules = StructureService.getModulesBySubject(subject.subject_id);

      // Resources categorized for this subject
      const allResources = ResourceService.getAllResources({ subject_id: subject.subject_id, is_published: 1 });
      const questionPapers = allResources.filter(r => r.type_slug === 'question-paper');
      const labResources = allResources.filter(r => r.type_slug === 'lab-manual' || r.type_slug === 'program');
      const generalResources = allResources.filter(r => !r.module_id && r.type_slug !== 'question-paper' && r.type_slug !== 'lab-manual' && r.type_slug !== 'program');

      res.render('public/subject-detail', {
        pageTitle: `${subject.name} (${subject.code})`,
        activeNav: 'semesters',
        semester,
        subject,
        modules,
        questionPapers,
        labResources,
        generalResources
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/semesters');
    }
  },

  // Click 4: Module Detail -> Learning Resources (/modules/:id)
  getModuleDetail(req, res) {
    try {
      const moduleItem = StructureService.getModule(req.params.id);
      const subject = StructureService.getSubject(moduleItem.subject_id);
      const semester = StructureService.getSemester(subject.semester_id);
      const resources = ResourceService.getAllResources({ module_id: moduleItem.module_id, is_published: 1 });

      res.render('public/module-detail', {
        pageTitle: `Module ${moduleItem.module_number}: ${moduleItem.title}`,
        activeNav: 'semesters',
        semester,
        subject,
        moduleItem,
        resources
      });
    } catch (err) {
      req.flash('error', err.message);
      res.redirect('/semesters');
    }
  },

  // Lab Section (/lab)
  getLabSection(req, res) {
    const db = getDb();
    // Fetch subjects that have lab resources or are lab courses
    const labSubjects = db.prepare(`
      SELECT DISTINCT s.*, sem.name as semester_name
      FROM subjects s
      JOIN semesters sem ON s.semester_id = sem.semester_id
      LEFT JOIN resources r ON s.subject_id = r.subject_id
      LEFT JOIN resource_types rt ON r.type_id = rt.type_id
      WHERE s.code LIKE '%L%' OR s.name LIKE '%Lab%' OR rt.slug IN ('lab-manual', 'program')
      ORDER BY sem.display_order ASC, s.name ASC
    `).all();

    const selectedSubjectId = req.query.subject_id || (labSubjects[0] ? labSubjects[0].subject_id : null);
    let labResources = [];
    let currentSubject = null;

    if (selectedSubjectId) {
      currentSubject = labSubjects.find(s => s.subject_id == selectedSubjectId);
      labResources = ResourceService.getAllResources({
        subject_id: selectedSubjectId,
        is_published: 1
      }).filter(r => r.type_slug === 'lab-manual' || r.type_slug === 'program' || r.type_slug === 'other');
    }

    res.render('public/lab', {
      pageTitle: 'Laboratory Resources & Code',
      activeNav: 'lab',
      labSubjects,
      selectedSubjectId: parseInt(selectedSubjectId, 10),
      currentSubject,
      labResources
    });
  },

  // Question Papers (/question-papers)
  getQuestionPapers(req, res) {
    const subjects = StructureService.getAllSubjects();
    const selectedSubjectId = req.query.subject_id || '';
    const selectedYear = req.query.year || '';

    const filter = { type_slug: 'question-paper', is_published: 1 };
    if (selectedSubjectId) filter.subject_id = selectedSubjectId;

    let papers = ResourceService.getAllResources(filter);
    if (selectedYear) {
      papers = papers.filter(p => p.exam_year == selectedYear);
    }

    // Group papers by year
    const papersByYear = {};
    papers.forEach(p => {
      const yearKey = p.exam_year || 'General / Undated';
      if (!papersByYear[yearKey]) papersByYear[yearKey] = [];
      papersByYear[yearKey].push(p);
    });

    res.render('public/question-papers', {
      pageTitle: 'Previous Year Question Papers',
      activeNav: 'question-papers',
      subjects,
      selectedSubjectId,
      selectedYear,
      papersByYear,
      totalCount: papers.length
    });
  }
};

module.exports = { BrowseController };

