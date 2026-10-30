import { useState, type FormEvent } from 'react';
import { Plus, BookOpen, Trash2, Edit2, Search, ChevronDown, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AppData, Subject } from '@/types';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';

export function AdminSubjects({
  data,
  onRefresh,
  showToast,
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All semesters');

  const filtered = data.subjects.filter((s) => {
    const matchesSearch = `${s.name} ${s.code} ${s.module}`.toLowerCase().includes(search.toLowerCase());
    const matchesSemester = semesterFilter === 'All semesters' || s.semester === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  const confirmDelete = async () => {
    if (!subjectToDelete) return;
    setDeleteBusy(true);
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectToDelete.id);
      if (error) throw error;
      showToast(`Subject '${subjectToDelete.name}' deleted.`);
      setSubjectToDelete(null);
      await onRefresh();
    } catch (err: unknown) {
      console.error('Subject delete error:', err);
      showToast('Could not delete subject. Check related materials.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Catalog</p>
          <h1>Manage Subjects</h1>
          <p className="intro">Define and maintain course subjects, codes, semester mappings, and module structures.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setEditingSubject(null);
            setModalOpen(true);
          }}
          type="button"
        >
          <Plus size={17} /> Add Subject
        </button>
      </section>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject code, name, or module…"
            aria-label="Search subjects"
          />
        </div>
        <div className="filter-select">
          <BookOpen size={16} />
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
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
      </div>

      <div className="subject-list">
        {filtered.map((subject) => {
          const materialCount = data.materials.filter((m) => m.subject_id === subject.id).length;
          return (
            <div className={`subject-large ${subject.accent}`} key={subject.id}>
              <div className="subject-large-icon">
                <BookOpen size={22} />
              </div>
              <div>
                <span>
                  {subject.code} · {subject.semester}
                </span>
                <h3>{subject.name}</h3>
                <p>{subject.module}</p>
              </div>
              <div className="subject-count">
                {materialCount}
                <small>resources</small>
              </div>
              <div className="row-actions admin-action-buttons">
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditingSubject(subject);
                    setModalOpen(true);
                  }}
                  title="Edit Subject"
                  aria-label={`Edit ${subject.name}`}
                  type="button"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="icon-button danger-icon"
                  onClick={() => setSubjectToDelete(subject)}
                  title="Delete Subject"
                  aria-label={`Delete ${subject.name}`}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState
            icon={<Layers size={26} />}
            title="No subjects found"
            text="Adjust your search filter or add your first course subject."
            action={{
              label: 'Add Subject',
              onClick: () => {
                setEditingSubject(null);
                setModalOpen(true);
              },
            }}
          />
        )}
      </div>

      {modalOpen && (
        <SubjectModal
          subjectToEdit={editingSubject}
          onClose={() => {
            setModalOpen(false);
            setEditingSubject(null);
          }}
          onSaved={async () => {
            setModalOpen(false);
            setEditingSubject(null);
            await onRefresh();
            showToast(editingSubject ? 'Subject updated.' : 'New subject created.');
          }}
        />
      )}

      {subjectToDelete && (
        <ConfirmModal
          title="Delete Course Subject"
          message={`Are you sure you want to delete '${subjectToDelete.name}' (${subjectToDelete.code})? Any materials under this subject will also be affected.`}
          confirmLabel="Delete Subject"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onClose={() => setSubjectToDelete(null)}
        />
      )}
    </>
  );
}

function SubjectModal({
  subjectToEdit,
  onClose,
  onSaved,
}: {
  subjectToEdit: Subject | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const isEditing = Boolean(subjectToEdit);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const code = String(form.get('code') ?? '').trim().toUpperCase();
    const semester = String(form.get('semester') ?? 'Semester 1');
    const moduleName = String(form.get('module') ?? 'Core module');
    const accent = String(form.get('accent') ?? 'blue');

    if (isEditing && subjectToEdit) {
      const { error } = await supabase
        .from('subjects')
        .update({ name, code, semester, module: moduleName, accent })
        .eq('id', subjectToEdit.id);
      if (!error) await onSaved();
    } else {
      const { error } = await supabase
        .from('subjects')
        .insert({ name, code, semester, module: moduleName, accent });
      if (!error) await onSaved();
    }
    setBusy(false);
  };

  return (
    <Modal
      onClose={onClose}
      title={isEditing ? 'Edit Subject' : 'Add Course Subject'}
      eyebrow="Academic Catalog"
    >
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Subject Name
          <input
            name="name"
            defaultValue={subjectToEdit?.name ?? ''}
            placeholder="e.g. Operating Systems"
            required
          />
        </label>
        <div className="form-two">
          <label>
            Subject Code
            <input
              name="code"
              defaultValue={subjectToEdit?.code ?? ''}
              placeholder="e.g. CS212"
              required
            />
          </label>
          <label>
            Semester
            <select name="semester" defaultValue={subjectToEdit?.semester ?? 'Semester 1'}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={`Semester ${s}`}>
                  Semester {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-two">
          <label>
            Primary Module / Specialization
            <input
              name="module"
              defaultValue={subjectToEdit?.module ?? ''}
              placeholder="e.g. Core module"
              required
            />
          </label>
          <label>
            Card Accent Tone
            <select name="accent" defaultValue={subjectToEdit?.accent ?? 'blue'}>
              <option value="blue">Blue</option>
              <option value="mint">Mint</option>
              <option value="coral">Coral</option>
              <option value="amber">Amber</option>
            </select>
          </label>
        </div>
        <div className="modal-actions-bar">
          <button type="button" className="outline-button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Subject'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
