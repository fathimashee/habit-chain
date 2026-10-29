const fs = require('fs');
const path = require('path');
const { getDb } = require('../connection');

function seedResources() {
  const db = getDb();
  const admin = db.prepare('SELECT admin_id FROM admins LIMIT 1').get();
  if (!admin) {
    console.error('No admin found, run seedDatabase first');
    return;
  }

  const types = db.prepare('SELECT * FROM resource_types').all();
  const typeMap = {};
  types.forEach(t => typeMap[t.slug] = t.type_id);

  const subjects = db.prepare('SELECT * FROM subjects').all();
  const subMap = {};
  subjects.forEach(s => subMap[s.code] = s.subject_id);

  const modules = db.prepare('SELECT * FROM modules').all();

  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  function addSample(title, code, modNum, typeSlug, sampleFile, examYear) {
    const subId = subMap[code];
    let modId = null;
    if (modNum) {
      const mod = modules.find(m => m.subject_id === subId && m.module_number === modNum);
      if (mod) modId = mod.module_id;
    }
    const typeId = typeMap[typeSlug] || typeMap['notes'];

    let fileName = Date.now() + '-' + path.basename(sampleFile).replace(/[^a-zA-Z0-9.-]/g, '_');
    let targetPath = path.join(uploadDir, fileName);
    let fileSize = 1024;
    let ext = path.extname(sampleFile).replace('.', '').toLowerCase();

    if (fs.existsSync(sampleFile)) {
      fs.copyFileSync(sampleFile, targetPath);
      fileSize = fs.statSync(targetPath).size;
    } else {
      fs.writeFileSync(targetPath, 'Sample educational document content for ' + title);
    }

    db.prepare(`
      INSERT INTO resources (
        title, description, subject_id, module_id, type_id, exam_year,
        file_path, original_filename, file_format, file_size, is_published, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      title,
      'Syllabus material and reference guide.',
      subId,
      modId,
      typeId,
      examYear || null,
      fileName,
      path.basename(sampleFile),
      ext,
      fileSize,
      admin.admin_id
    );
  }

  const count = db.prepare('SELECT COUNT(*) as c FROM resources').get().c;
  if (count === 0) {
    console.log('Seeding real PDF sample materials...');
    addSample('Module 1: Digital Electronics & Logic Gates', 'BCA101', 1, 'notes', 'C:\\Users\\Xpro\\Downloads\\semester 1\\BCA_Digital_Electronics_Module_1.pdf');
    addSample('Module 2: Combinational Logic Circuits', 'BCA101', 2, 'notes', 'C:\\Users\\Xpro\\Downloads\\semester 1\\BCA_Digital_Electronics_Module_2.pdf');
    addSample('Digital Electronics 2024 University Question Paper', 'BCA101', null, 'question-paper', 'C:\\Users\\Xpro\\Downloads\\semester 1\\BCA_Digital_Electronics_Module_3.pdf', 2024);

    addSample('Structured Programming in C - Functions & Arrays', 'BCA102', 2, 'notes', 'C:\\Users\\Xpro\\Downloads\\semester 1\\Structured_Programming_using_C_Module_2.pdf');
    addSample('C Programming Lab Manual & Core Experiments', 'BCA103L', 1, 'lab-manual', 'C:\\Users\\Xpro\\Downloads\\semester 1\\Structured_Programming_using_C_Module_4.pdf');

    addSample('Data Structures - Linear Lists & Stacks', 'BCA201', 1, 'notes', 'C:\\Users\\Xpro\\Downloads\\semester 2\\Data_Structures_module_1.pdf');
    addSample('Data Structures 2023 University Question Paper', 'BCA201', null, 'question-paper', 'C:\\Users\\Xpro\\Downloads\\semester 2\\Data_Structures_module_2.pdf', 2023);
    addSample('OOP using Java - Core Syntax & Objects', 'BCA202', 1, 'notes', 'C:\\Users\\Xpro\\Downloads\\semester 2\\OOP_Using_Java_module_1.pdf');
    addSample('Data Structures Practical Experiment Programs', 'BCA203L', 1, 'program', 'C:\\Users\\Xpro\\Downloads\\semester 2\\DS module 4_full - Fathima Anas.pdf');
    console.log('Seeded sample resources successfully!');
  } else {
    console.log('Resources already present:', count);
  }
}

if (require.main === module) {
  seedResources();
}

module.exports = { seedResources };

