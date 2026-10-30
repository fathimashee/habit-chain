import { useState, type FormEvent, type DragEvent } from 'react';
import {
  Upload,
  Check,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AppData, MaterialType } from '@/types';

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.zip',
  '.c',
  '.cpp',
  '.java',
  '.py',
  '.png',
  '.jpg',
  '.jpeg',
];

export function AdminUploadView({
  data,
  onRefresh,
  showToast,
  onSuccessNavigate,
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onSuccessNavigate: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError('');
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds maximum allowable size of 10 MB.');
      return;
    }
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`File type '${ext}' is not supported. Please upload a PDF, Word doc, source code, or archive.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    const form = new FormData(e.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const type = String(form.get('type') ?? 'note') as MaterialType;
    const subjectId = String(form.get('subject_id') ?? '');
    const semester = String(form.get('semester') ?? 'Semester 1');
    const moduleName = String(form.get('module') ?? 'Core Module');

    if (!title || !description || !subjectId) {
      setError('Please fill in all required fields.');
      setBusy(false);
      return;
    }

    try {
      let filePath: string | null = null;
      if (selectedFile) {
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const uploadKey = `${crypto.randomUUID()}-${safeName}`;

        const uploadRes = await supabase.storage.from('study-materials').upload(uploadKey, selectedFile);
        if (uploadRes.error) {
          throw new Error(`Upload error: ${uploadRes.error.message}`);
        }
        filePath = uploadKey;
      }

      const { data: authUser } = await supabase.auth.getUser();

      const { error: insertErr } = await supabase.from('study_materials').insert({
        title,
        description,
        type,
        subject_id: subjectId,
        semester,
        module: moduleName,
        file_path: filePath,
        uploaded_by: authUser.user?.id,
        pages: 1,
      });

      if (insertErr) throw insertErr;

      setSuccess(`'${title}' has been uploaded and published successfully.`);
      showToast(`'${title}' has been added to the library.`);
      setSelectedFile(null);
      await onRefresh();
    } catch (caught: unknown) {
      console.error('Upload submission error:', caught);
      const msg = typeof caught === 'object' && caught !== null && 'message' in caught
        ? String((caught as { message: string }).message)
        : 'Failed to publish material. Please try again.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Content Delivery</p>
          <h1>Upload Study Materials</h1>
          <p className="intro">
            Publish lecture notes, university question papers, lab programs, and syllabus guides for students.
          </p>
        </div>
      </section>

      <div className="upload-view-layout">
        <form className="panel upload-form-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Resource Information</p>
              <h3>Material Specifications</h3>
            </div>
            <ShieldCheck size={20} className="text-muted" />
          </div>

          {error && (
            <div className="notice error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {success && (
            <div className="notice success">
              <Check size={15} />
              {success}
            </div>
          )}

          {/* Drag & drop upload area */}
          <div
            className={`dropzone-box ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">
              {selectedFile ? <FileText size={32} /> : <Upload size={32} />}
            </div>
            {selectedFile ? (
              <div className="dropzone-details">
                <strong>{selectedFile.name}</strong>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to upload</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setSelectedFile(null)}
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="dropzone-copy">
                <strong>Drag & drop material file here</strong>
                <span>Supports PDF, DOCX, ZIP, C, Java, Python (max 10 MB)</span>
                <label className="dropzone-file-btn">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.zip,.c,.cpp,.java,.py,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          <label>
            Material Title
            <input
              name="title"
              placeholder="e.g. CS201 Unit 2: Trees & Balanced Binary Trees"
              required
            />
          </label>

          <div className="form-two">
            <label>
              Material Type
              <select name="type" defaultValue="note">
                <option value="note">Lecture Note</option>
                <option value="question_paper">Question Paper</option>
                <option value="lab">Lab Manual / Program</option>
                <option value="guide">Study Guide</option>
              </select>
            </label>

            <label>
              Course Subject
              <select name="subject_id" required defaultValue={data.subjects[0]?.id || ''}>
                {data.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-two">
            <label>
              Semester
              <select name="semester" defaultValue="Semester 1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={`Semester ${s}`}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Module / Chapter
              <input name="module" placeholder="e.g. Module 3: Binary Search Trees" required />
            </label>
          </div>

          <label>
            Detailed Description
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Describe what concepts are covered, target exams, and practical references…"
            />
          </label>

          <div className="upload-submit-row">
            <button
              className="primary-button"
              type="submit"
              disabled={busy}
            >
              {busy ? 'Uploading & Publishing…' : 'Publish Material'} <Check size={16} />
            </button>
            {success && (
              <button
                type="button"
                className="outline-button"
                onClick={onSuccessNavigate}
              >
                Go to Materials Library <ArrowRight size={15} />
              </button>
            )}
          </div>
        </form>

        <aside className="upload-tips-panel panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Academic Guidelines</p>
              <h3>Upload Checklist</h3>
            </div>
          </div>
          <ul className="guidelines-list">
            <li>
              <Check size={15} />
              <div>
                <strong>Supported formats</strong>
                <span>PDFs for notes and papers; code files (.py, .c, .java) or ZIPs for lab programs.</span>
              </div>
            </li>
            <li>
              <Check size={15} />
              <div>
                <strong>Accurate Module Tagging</strong>
                <span>Tag with the specific semester and module name to help students find materials easily.</span>
              </div>
            </li>
            <li>
              <Check size={15} />
              <div>
                <strong>File Size Best Practices</strong>
                <span>Compress large presentation files or scan PDFs at 150–200 DPI for optimal mobile viewing.</span>
              </div>
            </li>
            <li>
              <Check size={15} />
              <div>
                <strong>Student Access</strong>
                <span>Materials are instantly available to all authenticated students in their library.</span>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
}
