const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR 
  ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allow-list for educational documents and code files
const ALLOWED_EXTENSIONS = [
  '.pdf', '.docx', '.pptx', '.zip',
  '.c', '.cpp', '.java', '.py', '.txt', '.sql'
];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/x-c',
  'text/x-c++',
  'text/x-java-source',
  'text/x-python',
  'application/sql',
  'text/x-sql',
  'application/octet-stream' // Many systems send source code/zips as octet-stream
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe, unguessable random filename while preserving normalized extension
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomHex}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File type "${ext}" is not supported. Allowed formats: PDF, DOCX, PPTX, ZIP, C, CPP, Java, Python, TXT, SQL.`));
  }

  // Double check MIME if present
  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Some code files have generic text or octet-stream
    if (!file.mimetype.startsWith('text/')) {
      return cb(new Error(`MIME type "${file.mimetype}" is not permitted.`));
    }
  }

  cb(null, true);
}

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10);

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024 // 25 MB default limit
  },
  fileFilter
});

module.exports = {
  upload,
  uploadDir,
  ALLOWED_EXTENSIONS
};

