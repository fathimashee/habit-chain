import { useState, useMemo, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  FileText,
  AlertCircle,
  Upload,
  BookOpen,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AppData, Material, MaterialType, Subject } from '@/types';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';

const PAGE_SIZE = 8;

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

function formatDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function subjectById(subjects: Subject[], id: string | null | undefined): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function AdminMaterials({
  data,
  onRefresh,
  showToast,
  forcedType,
  pageTitle = 'Manage Study Materials',
  pageIntro = 'Upload, edit, organize, and manage course notes, question papers, and lab manuals.',
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  forcedType?: MaterialType;
  pageTitle?: string;
  pageIntro?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Filters & Search & Sort
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All semesters');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [typeFilter, setTypeFilter] = useState<string>(forcedType ?? 'All types');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'downloads'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering
  const filteredMaterials = useMemo(() => {
    return data.materials.filter((item) => {
      const subj = subjectById(data.subjects, item.subject_id);
      const matchesSearch =
        `${item.title} ${item.description} ${subj?.name ?? ''} ${item.module ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSemester =
        semesterFilter === 'All semesters' ||
        item.semester === semesterFilter ||
        subj?.semester === semesterFilter;

      const matchesSubject =
        subjectFilter === 'All subjects' || subj?.name === subjectFilter;

      const effectiveTypeFilter = forcedType ?? typeFilter;
      const matchesType =
        effectiveTypeFilter === 'All types' || item.type === effectiveTypeFilter;

      return matchesSearch && matchesSemester && matchesSubject && matchesType;
    });
  }, [data.materials, data.subjects, search, semesterFilter, subjectFilter, typeFilter, forcedType]);

  // Sorting
  const sortedMaterials = useMemo(() => {
    const sorted = [...filteredMaterials];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.upload_date.localeCompare(a.upload_date));
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => a.upload_date.localeCompare(b.upload_date));
    } else if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'downloads') {
      sorted.sort((a, b) => b.downloads - a.downloads);
    }
    return sorted;
  }, [filteredMaterials, sortBy]);

  // Pagination
  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedMaterials.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedMaterials, currentPage]);

  // Download / View
  const handleViewDownload = async (material: Material) => {
    try {
      let url = material.file_url ?? null;
      if (material.file_path) {
        const { data: signed, error } = await supabase.storage
          .from('study-materials')
          .createSignedUrl(material.file_path, 3600);
        if (error) throw error;
        if (signed?.signedUrl) url = signed.signedUrl;
      }
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        showToast('No physical file is attached to this material entry.', 'error');
      }
    } catch (err) {
      console.error('Failed to open file:', err);
      showToast('Could not generate download link. Please verify file in storage.', 'error');
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!materialToDelete) return;
    setDeleteBusy(true);
    try {
      // Remove from storage if file_path exists
      if (materialToDelete.file_path) {
        await supabase.storage.from('study-materials').remove([materialToDelete.file_path]);
      }
      const { error } = await supabase.from('study_materials').delete().eq('id', materialToDelete.id);
      if (error) throw error;

      showToast(`'${materialToDelete.title}' has been deleted.`);
      setMaterialToDelete(null);
      await onRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('Failed to delete material.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Content Management</p>
          <h1>{pageTitle}</h1>
          <p className="intro">{pageIntro}</p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingMaterial(null);
            setModalOpen(true);
          }}
          type="button"
        >
          <Plus size={17} /> Add Material
        </button>
      </section>

      {/* Toolbar: Search, Filters, Sort */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, subject, or module…"
            aria-label="Search materials"
          />
        </div>

        <div className="filter-select">
          <BookOpen size={16} />
          <select
            value={semesterFilter}
            onChange={(e) => {
              setSemesterFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by semester"
          >
            <option>All semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={`Semester ${s}`}>
                Semester {s}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>

        <div className="filter-select">
          <BookOpen size={16} />
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by subject"
          >
            <option>All subjects</option>
            {data.subjects.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>

        {!forcedType && (
          <div className="filter-select">
            <FileText size={16} />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by type"
            >
              <option>All types</option>
              <option value="note">Notes</option>
              <option value="question_paper">Question Papers</option>
              <option value="lab">Lab Materials</option>
              <option value="guide">Guides</option>
            </select>
            <ChevronDown size={15} />
          </div>
        )}

        <div className="filter-select">
          <Filter size={16} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title' | 'downloads')}
            aria-label="Sort order"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="title">Sort: Title (A-Z)</option>
            <option value="downloads">Sort: Most Downloaded</option>
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      <div className="results-meta">
        <span>{sortedMaterials.length} materials matching criteria</span>
        {(search || semesterFilter !== 'All semesters' || subjectFilter !== 'All subjects' || typeFilter !== 'All types') && (
          <button
            className="text-button"
            onClick={() => {
              setSearch('');
              setSemesterFilter('All semesters');
              setSubjectFilter('All subjects');
              setTypeFilter(forcedType ?? 'All types');
              setCurrentPage(1);
            }}
            type="button"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Materials Table */}
      <section className="panel table-panel">
        <div className="table-head admin-materials-head">
          <span>Material & File</span>
          <span>Semester & Subject</span>
          <span>Category</span>
          <span>Upload Date</span>
          <span>Views</span>
          <span className="text-right">Actions</span>
        </div>

        {paginatedMaterials.map((material) => {
          const subj = subjectById(data.subjects, material.subject_id);
          const hasFile = Boolean(material.file_path || material.file_url);
          return (
            <div className="table-row admin-materials-row" key={material.id}>
              <div>
                <strong>{material.title}</strong>
                <small title={material.description}>
                  {material.description.length > 60
                    ? `${material.description.slice(0, 60)}…`
                    : material.description}
                  {material.file_path ? ` · 📁 ${material.file_path.split('-').slice(5).join('-') || 'file'}` : ''}
                </small>
              </div>

              <div>
                <span>{subj?.name ?? 'Unassigned'}</span>
                <small>{material.semester ?? subj?.semester ?? 'Semester 1'} · {material.module ?? 'Module'}</small>
              </div>

              <div>
                <span className={`status-chip ${material.type}`}>
                  {material.type === 'question_paper'
                    ? 'Question Paper'
                    : material.type === 'lab'
                    ? 'Lab Material'
                    : material.type.toUpperCase()}
                </span>
              </div>

              <span>{formatDate(material.upload_date)}</span>

              <span>{material.downloads}</span>

              <div className="row-actions admin-action-buttons">
                {hasFile && (
                  <button
                    className="icon-button"
                    onClick={() => handleViewDownload(material)}
                    title="View / Download Attached File"
                    aria-label={`View file for ${material.title}`}
                    type="button"
                  >
                    <ExternalLink size={15} />
                  </button>
                )}
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditingMaterial(material);
                    setModalOpen(true);
                  }}
                  title="Edit Material"
                  aria-label={`Edit ${material.title}`}
                  type="button"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  className="icon-button danger-icon"
                  onClick={() => setMaterialToDelete(material)}
                  title="Delete Material"
                  aria-label={`Delete ${material.title}`}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {paginatedMaterials.length === 0 && (
          <EmptyState
            title="No materials match your search"
            text="Try altering your search keywords or clearing the category and semester filters."
            action={{
              label: 'Add New Material',
              onClick: () => {
                setEditingMaterial(null);
                setModalOpen(true);
              },
            }}
          />
        )}
      </section>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={sortedMaterials.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Material Modal */}
      {modalOpen && (
        <MaterialFormModal
          subjects={data.subjects}
          materialToEdit={editingMaterial}
          defaultType={forcedType}
          onClose={() => {
            setModalOpen(false);
            setEditingMaterial(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditingMaterial(null);
            await onRefresh();
            showToast(editingMaterial ? 'Material updated successfully.' : 'New material uploaded.');
          }}
        />
      )}

      {/* Confirm Delete Dialog */}
      {materialToDelete && (
        <ConfirmModal
          title="Delete Material"
          message={`Are you sure you want to permanently delete '${materialToDelete.title}'? This action cannot be undone.`}
          confirmLabel="Delete Material"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onClose={() => setMaterialToDelete(null)}
        />
      )}
    </>
  );
}

/* ==========================================================================
   Material Form Modal (Add / Edit)
   ========================================================================== */
export function MaterialFormModal({
  subjects,
  materialToEdit,
  defaultType = 'note',
  onClose,
  onSaved,
}: {
  subjects: Subject[];
  materialToEdit: Material | null;
  defaultType?: MaterialType;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const isEditing = Boolean(materialToEdit);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const file = form.get('file') as File | null;
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const type = String(form.get('type') ?? defaultType) as MaterialType;
    const subjectId = String(form.get('subject_id') ?? '');
    const semester = String(form.get('semester') ?? 'Semester 1');
    const moduleName = String(form.get('module') ?? 'Core Module');

    if (!title || !description || !subjectId) {
      setError('Please provide a title, description, and assign a subject.');
      setBusy(false);
      return;
    }

    try {
      let filePath: string | null = materialToEdit?.file_path ?? null;

      // Handle new file upload if provided
      if (file && file.size > 0) {
        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File exceeds the 10 MB limit. Please select a smaller document.');
        }

        // Validate extension
        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          throw new Error(`File format '${ext}' is not supported. Please upload a PDF, Word document, code file, or archive.`);
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const uploadKey = `${crypto.randomUUID()}-${safeName}`;

        const uploadRes = await supabase.storage.from('study-materials').upload(uploadKey, file, {
          upsert: true,
        });

        if (uploadRes.error) {
          throw new Error(`Storage upload failed: ${uploadRes.error.message}`);
        }
        filePath = uploadKey;
      }

      const { data: authUser } = await supabase.auth.getUser();

      if (isEditing && materialToEdit) {
        const { error: updateError } = await supabase
          .from('study_materials')
          .update({
            title,
            description,
            type,
            subject_id: subjectId,
            semester,
            module: moduleName,
            file_path: filePath,
          })
          .eq('id', materialToEdit.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('study_materials').insert({
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

        if (insertError) throw insertError;
      }

      await onSaved();
    } catch (caught: unknown) {
      console.error('Save material error:', caught);
      const msg = typeof caught === 'object' && caught !== null && 'message' in caught
        ? String((caught as { message: string }).message)
        : 'Could not save the material. Please check details and try again.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={isEditing ? 'Edit Study Material' : 'Add Study Material'}
      eyebrow="Academic Repository"
      maxWidth="540px"
    >
      <p className="modal-copy">
        {isEditing
          ? 'Update material metadata, assigned subject, semester, or attach a revised document.'
          : 'Upload a learning resource. Files can be PDFs, Word docs, code files, or archives under 10 MB.'}
      </p>

      {error && (
        <div className="notice error">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Material Title
          <input
            name="title"
            defaultValue={materialToEdit?.title ?? ''}
            placeholder="e.g. Unit 3: Graph Algorithms & DFS"
            required
          />
        </label>

        <div className="form-two">
          <label>
            Category / Type
            <select name="type" defaultValue={materialToEdit?.type ?? defaultType}>
              <option value="note">Lecture Notes</option>
              <option value="question_paper">Question Paper</option>
              <option value="lab">Lab Manual / Program</option>
              <option value="guide">Study Guide</option>
            </select>
          </label>

          <label>
            Assigned Subject
            <select
              name="subject_id"
              required
              defaultValue={materialToEdit?.subject_id ?? (subjects[0]?.id || '')}
            >
              {subjects.map((sub) => (
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
            <select name="semester" defaultValue={materialToEdit?.semester ?? 'Semester 1'}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={`Semester ${s}`}>
                  Semester {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            Module / Topic
            <input
              name="module"
              defaultValue={materialToEdit?.module ?? 'Core Module'}
              placeholder="e.g. Module 2: Memory Management"
              required
            />
          </label>
        </div>

        <label>
          Description & Syllabus Coverage
          <textarea
            name="description"
            rows={3}
            required
            defaultValue={materialToEdit?.description ?? ''}
            placeholder="Summarize the concepts covered and relevant exam sections…"
          />
        </label>

        <label className="file-input">
          <Upload size={17} />
          <span>
            {selectedFileName
              ? `Selected: ${selectedFileName}`
              : materialToEdit?.file_path
              ? 'Replace current document (optional)'
              : 'Choose file to attach (.pdf, .doc, .zip, .c, .py…)'}
          </span>
          <input
            name="file"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.zip,.c,.cpp,.java,.py,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFileName(e.target.files[0].name);
              }
            }}
          />
        </label>

        <div className="modal-actions-bar">
          <button
            type="button"
            className="outline-button"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {busy ? 'Saving…' : isEditing ? 'Save Changes' : 'Upload Material'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
