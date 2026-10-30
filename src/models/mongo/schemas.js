const mongoose = require('mongoose');

// 1. Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'super_admin' },
  created_at: { type: Date, default: Date.now }
});

// 2. Semester Schema
const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  display_order: { type: Number, required: true }
});

// 3. Subject Schema
const subjectSchema = new mongoose.Schema({
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String }
});
subjectSchema.index({ semester_id: 1, code: 1 }, { unique: true });

// 4. Module Schema
const moduleSchema = new mongoose.Schema({
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  module_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String }
});
moduleSchema.index({ subject_id: 1, module_number: 1 }, { unique: true });

// 5. Resource Type Schema
const resourceTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
});

// 6. Resource Schema
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceType', required: true },
  exam_year: { type: Number },
  file_path: { type: String, required: true },
  original_filename: { type: String, required: true },
  file_format: { type: String, required: true },
  file_size: { type: Number, default: 0 },
  download_count: { type: Number, default: 0 },
  is_published: { type: Number, default: 1 },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// 7. Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
  avatar_color: { type: String, default: '#0F9D9A' },
  is_active: { type: Number, default: 1 },
  email_verified: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  last_login_at: { type: Date }
});

// 8. Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  resource_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  created_at: { type: Date, default: Date.now }
});
bookmarkSchema.index({ student_id: 1, resource_id: 1 }, { unique: true });

// 9. Password Reset Schema
const passwordResetSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  token_hash: { type: String, required: true },
  expires_at: { type: Date, required: true },
  used_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now }
});

// 10. Announcement Schema
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  expires_at: { type: Date },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  created_at: { type: Date, default: Date.now }
});

// 11. Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  category: { type: String, default: 'General' },
  message: { type: String, required: true },
  rating: { type: Number, default: 5 },
  is_read: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

// 12. Contact Message Schema
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Semester = mongoose.models.Semester || mongoose.model('Semester', semesterSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);
const ResourceType = mongoose.models.ResourceType || mongoose.model('ResourceType', resourceTypeSchema);
const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', passwordResetSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);

module.exports = {
  Admin,
  Semester,
  Subject,
  Module,
  ResourceType,
  Resource,
  Student,
  Bookmark,
  PasswordReset,
  Announcement,
  Feedback,
  ContactMessage
};

