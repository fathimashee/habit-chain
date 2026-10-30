import { useState, type FormEvent, type ReactNode } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  ArrowRight,
  Bell,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  AppData,
  Feedback,
  Material,
  Profile,
  StudentView,
  Subject,
  Announcement,
  ContactRequest,
  DownloadRecord,
} from '@/types';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';

function formatDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function subjectById(subjects: Subject[], id: string | null | undefined): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

/* ==========================================================================
   1. Student Overview
   ========================================================================== */
export function StudentOverview({
  profile,
  data,
  navigate,
}: {
  profile: Profile;
  data: AppData;
  navigate: (view: StudentView) => void;
}) {
  const firstName = profile.name.split(' ')[0] || 'Student';
  const currentDate = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">{currentDate}</p>
          <h1>
            Hi, {firstName} <Sparkles className="welcome-spark" size={20} />
          </h1>
          <p className="intro">
            Welcome to your learning portal. Access your study materials, question papers, and course syllabus anytime.
          </p>
        </div>
        <button className="primary-button" onClick={() => navigate('materials')}>
          Explore materials <ArrowRight size={17} />
        </button>
      </section>

      <section className="hero-card">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="pulse-dot" /> Academic Library
          </div>
          <h2>
            Focused learning.<br />
            <strong>Structured progress.</strong>
          </h2>
          <p>Organize your study routine with verified subject notes, past question papers, and lab manuals.</p>
          <button className="light-button" onClick={() => navigate('materials')}>
            Browse Library <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-graphic">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="book-circle">
            <BookOpen size={38} />
          </div>
          <div className="floating-note note-one">
            <BookOpen size={12} /> Syllabus
          </div>
          <div className="floating-note note-two">
            <Check size={13} /> Updated
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <Stat
          icon={<BookOpen size={19} />}
          label="Materials Available"
          value={`${data.materials.length}`}
          detail={`${data.subjects.length} subjects`}
          tone="blue"
        />
        <Stat
          icon={<FileText size={19} />}
          label="Question Papers"
          value={`${data.materials.filter((m) => m.type === 'question_paper').length}`}
          detail="Past exams"
          tone="mint"
        />
        <Stat
          icon={<Download size={19} />}
          label="Your Downloads"
          value={`${data.downloads.length}`}
          detail="Accessed resources"
          tone="coral"
        />
        <Stat
          icon={<Star size={19} />}
          label="Academic Level"
          value={profile.level ?? 'UG'}
          detail={profile.enrollment_no ? `No: ${profile.enrollment_no}` : 'Registered'}
          tone="amber"
        />
      </div>

      <div className="section-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Academic Catalog</p>
              <h3>Semesters & Modules</h3>
            </div>
            <button className="text-button" onClick={() => navigate('subjects')}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="semester-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
              const semMaterials = data.materials.filter((m) => m.semester === `Semester ${sem}`);
              const semSubjects = data.subjects.filter((s) => s.semester === `Semester ${sem}`);
              return (
                <button
                  key={sem}
                  className="semester-card"
                  onClick={() => navigate('materials')}
                >
                  <div className="semester-card-top">
                    <div className="semester-card-icon">
                      <BookOpen size={18} />
                    </div>
                    <ArrowRight size={15} />
                  </div>
                  <strong>Semester {sem}</strong>
                  <span>{semSubjects.length} subjects · {semMaterials.length} materials</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel announcement-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Notice Board</p>
              <h3>Announcements</h3>
            </div>
            <button className="text-button" onClick={() => navigate('announcements')}>
              View all
            </button>
          </div>
          {data.announcements.slice(0, 3).map((item) => (
            <div className="announcement" key={item.id}>
              <div className={`announcement-icon ${item.priority}`}>
                <Bell size={16} />
              </div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <span>{item.priority === 'important' ? 'Important notice' : formatDate(item.published_at)}</span>
              </div>
            </div>
          ))}
          {data.announcements.length === 0 && (
            <EmptyState title="No announcements" text="Official updates will appear here." />
          )}
        </section>
      </div>

      <section className="panel recent-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent Additions</p>
            <h3>Latest Uploads</h3>
          </div>
          <button className="text-button" onClick={() => navigate('materials')}>
            See all <ArrowRight size={15} />
          </button>
        </div>
        {data.materials.slice(0, 4).map((material) => (
          <div className="material-row" key={material.id}>
            <div className={`row-file ${subjectById(data.subjects, material.subject_id)?.accent ?? 'blue'}`}>
              <FileText size={18} />
            </div>
            <div className="row-content">
              <strong>{material.title}</strong>
              <span>
                {subjectById(data.subjects, material.subject_id)?.name ?? 'General'} ·{' '}
                {material.semester ?? 'Semester 1'}
              </span>
            </div>
            <span className="row-type">
              {material.type === 'question_paper'
                ? 'Question Paper'
                : material.type === 'lab'
                ? 'Lab Material'
                : 'Study Note'}
            </span>
          </div>
        ))}
        {data.materials.length === 0 && (
          <EmptyState title="No materials available" text="Study materials will appear once uploaded by teachers." />
        )}
      </section>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. Study Materials View
   ========================================================================== */
export function MaterialsView({
  data,
  onRefresh,
  showToast,
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}) {
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All semesters');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [typeFilter, setTypeFilter] = useState('All types');

  const filtered = data.materials.filter((material) => {
    const itemSubject = subjectById(data.subjects, material.subject_id);
    const matchesSearch =
      `${material.title} ${material.description} ${itemSubject?.name ?? ''} ${material.module ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesSemester =
      semesterFilter === 'All semesters' ||
      material.semester === semesterFilter ||
      itemSubject?.semester === semesterFilter;

    const matchesSubject =
      subjectFilter === 'All subjects' || itemSubject?.name === subjectFilter;

    const matchesType = typeFilter === 'All types' || material.type === typeFilter;

    return matchesSearch && matchesSemester && matchesSubject && matchesType;
  });

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Repository</p>
          <h1>Study materials</h1>
          <p className="intro">
            Browse and download course notes, question papers, and laboratory resources by semester and subject.
          </p>
        </div>
        {(search || semesterFilter !== 'All semesters' || subjectFilter !== 'All subjects' || typeFilter !== 'All types') && (
          <button
            className="outline-button"
            onClick={() => {
              setSearch('');
              setSemesterFilter('All semesters');
              setSubjectFilter('All subjects');
              setTypeFilter('All types');
            }}
          >
            <Filter size={15} /> Clear filters
          </button>
        )}
      </section>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, subjects, or keywords…"
            aria-label="Search study materials"
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={`Semester ${sem}`}>
                Semester {sem}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>

        <div className="filter-select">
          <BookOpen size={16} />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter by subject"
          >
            <option>All subjects</option>
            {data.subjects.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>

        <div className="filter-select">
          <FileText size={16} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by material type"
          >
            <option>All types</option>
            <option value="note">Notes</option>
            <option value="question_paper">Question Papers</option>
            <option value="lab">Lab Materials</option>
            <option value="guide">Study Guides</option>
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      <div className="results-meta">
        <span>{filtered.length} resources found</span>
        <span>Showing latest uploads first</span>
      </div>

      <section className="material-grid">
        {filtered.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            subject={subjectById(data.subjects, material.subject_id)}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        ))}
        {filtered.length === 0 && (
          <EmptyState
            title="No study materials found"
            text="Try adjusting your filters, searching with different terms, or resetting selections."
          />
        )}
      </section>
    </>
  );
}

/* ==========================================================================
   3. Material Card (Reusable Download / View Flow)
   ========================================================================== */
export function MaterialCard({
  material,
  subject,
  onRefresh,
  showToast,
}: {
  material: Material;
  subject?: Subject;
  onRefresh: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}) {
  const [busy, setBusy] = useState(false);

  const handleAccess = async () => {
    setBusy(true);
    try {
      let fileUrl = material.file_url ?? null;

      if (material.file_path) {
        const { data: signedData, error } = await supabase.storage
          .from('study-materials')
          .createSignedUrl(material.file_path, 3600);

        if (error) {
          console.error('Storage signed URL error:', error);
          throw new Error('Could not generate download link.');
        }
        if (signedData?.signedUrl) {
          fileUrl = signedData.signedUrl;
        }
      }

      // Record access in download_records
      try {
        await supabase.from('download_records').insert({
          material_id: material.id,
          action: fileUrl ? 'download' : 'view',
        });
      } catch (logErr) {
        console.warn('Could not record download history:', logErr);
      }

      if (fileUrl) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
        showToast('Resource opened in a new tab.');
      } else {
        showToast('This resource does not have an attached file yet.', 'error');
      }

      await onRefresh();
    } catch (caught) {
      console.error('Material access error:', caught);
      showToast('We could not open that file right now. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const typeDisplay =
    material.type === 'question_paper'
      ? 'QUESTION PAPER'
      : material.type === 'lab'
      ? 'LAB MANUAL'
      : material.type === 'guide'
      ? 'STUDY GUIDE'
      : 'NOTE';

  return (
    <article className="material-card">
      <div className={`material-cover ${subject?.accent ?? 'blue'}`}>
        <FileText size={28} />
        <span>{typeDisplay}</span>
        <b>{material.pages || 1} pages</b>
      </div>
      <div className="material-body">
        <div className="material-tag">
          {subject?.code ?? 'GEN'} <span>·</span> {subject?.name ?? 'General'}
        </div>
        <h3>{material.title}</h3>
        <p>{material.description}</p>
        <div className="material-meta">
          <span>{material.semester ?? subject?.semester ?? 'Semester 1'}</span>
          <span>{material.module ?? subject?.module ?? 'Core Module'}</span>
        </div>
        <div className="material-footer">
          <span>
            <Download size={14} /> {material.downloads} views
          </span>
          <button
            className="download-button"
            onClick={handleAccess}
            disabled={busy}
            type="button"
          >
            {material.file_path || material.file_url ? (
              <>
                <Download size={15} /> {busy ? 'Opening…' : 'View / Download'}
              </>
            ) : (
              <>
                <Eye size={15} /> Details only
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
   4. Subjects View
   ========================================================================= */
export function SubjectsView({
  data,
  navigate,
}: {
  data: AppData;
  navigate: (view: StudentView) => void;
}) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Curriculum</p>
          <h1>Course Subjects</h1>
          <p className="intro">Explore all course subjects organized by semester and module specifications.</p>
        </div>
      </section>

      <div className="subject-list">
        {data.subjects.map((subject) => {
          const materialCount = data.materials.filter((m) => m.subject_id === subject.id).length;
          return (
            <button
              className={`subject-large ${subject.accent}`}
              key={subject.id}
              onClick={() => navigate('materials')}
              type="button"
            >
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
              <ArrowRight size={18} />
            </button>
          );
        })}
        {data.subjects.length === 0 && (
          <EmptyState title="No subjects configured" text="Subjects will appear here once added by administrators." />
        )}
      </div>
    </>
  );
}

/* ==========================================================================
   5. Question Papers View
   ========================================================================== */
export function PapersView({
  data,
  onRefresh,
  showToast,
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');

  const papers = data.materials.filter((m) => m.type === 'question_paper');
  const filtered = papers.filter((material) => {
    const itemSubject = subjectById(data.subjects, material.subject_id);
    const matchesSearch = `${material.title} ${material.description} ${itemSubject?.name ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'All subjects' || itemSubject?.name === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Exam Archive</p>
          <h1>Past Question Papers</h1>
          <p className="intro">Review past university exam papers and model question sets for exam preparation.</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question papers…"
            aria-label="Search question papers"
          />
        </div>
        <div className="filter-select">
          <FileText size={16} />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter by subject"
          >
            <option>All subjects</option>
            {data.subjects.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      <div className="results-meta">
        <span>{filtered.length} question papers available</span>
      </div>

      <section className="material-grid">
        {filtered.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            subject={subjectById(data.subjects, material.subject_id)}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        ))}
        {filtered.length === 0 && (
          <EmptyState
            title="No question papers found"
            text="Past question papers will appear here once uploaded by the department."
          />
        )}
      </section>
    </>
  );
}

/* ==========================================================================
   6. Downloads History View
   ========================================================================== */
export function DownloadsView({
  downloads,
  showToast,
}: {
  downloads: DownloadRecord[];
  showToast: (message: string) => void;
}) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Activity Log</p>
          <h1>Download Records</h1>
          <p className="intro">Keep track of the study notes and past question papers you have opened or downloaded.</p>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="table-head">
          <span>Material</span>
          <span>Action</span>
          <span>Date</span>
          <span>Options</span>
        </div>
        {downloads.map((record) => (
          <div className="table-row" key={record.id}>
            <div>
              <strong>{record.material?.title ?? 'Archived Material'}</strong>
              <small>{record.material?.type ? record.material.type.replace('_', ' ') : 'Resource'}</small>
            </div>
            <span className="status-chip neutral">{record.action}</span>
            <span>{formatDate(record.created_at)}</span>
            <button
              className="icon-button"
              aria-label="Download record action"
              onClick={() => showToast('Record is verified in your history.')}
              type="button"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        ))}
        {downloads.length === 0 && (
          <EmptyState title="No downloads yet" text="When you view or download materials, they will appear in this history." />
        )}
      </section>
    </>
  );
}

/* ==========================================================================
   7. Feedback System View
   ========================================================================== */
export function FeedbackView({
  profile,
  feedback,
  onRefresh,
  showToast,
}: {
  profile: Profile;
  feedback: Feedback[];
  onRefresh: () => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Student Voice</p>
          <h1>Feedback System</h1>
          <p className="intro">
            Tell us about your learning experience, request missing notes, or suggest improvements.
          </p>
        </div>
        <button className="primary-button" onClick={() => setModalOpen(true)}>
          <Plus size={17} /> Submit feedback
        </button>
      </section>

      <section className="feedback-cards">
        {feedback.map((item) => (
          <div className="feedback-card" key={item.id}>
            <div className="feedback-card-top">
              <div className="rating">
                {Array.from({ length: 5 }, (_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    fill={idx < item.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className={`status-chip ${item.status}`}>{item.status}</span>
            </div>
            <p>{item.message}</p>
            <small>{formatDate(item.created_at)}</small>
          </div>
        ))}
        {feedback.length === 0 && (
          <EmptyState
            title="No feedback submitted yet"
            text="Share your thoughts to help improve academic materials for your batch."
          />
        )}
      </section>

      {modalOpen && (
        <FeedbackModal
          profile={profile}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await onRefresh();
            showToast('Thank you! Your feedback has been received.');
          }}
        />
      )}
    </>
  );
}

function FeedbackModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from('feedback').insert({
      user_id: profile.user_id,
      name: profile.name,
      message: form.get('message'),
      rating: Number(form.get('rating')),
    });
    setBusy(false);
    if (!error) {
      await onSaved();
    }
  };

  return (
    <Modal onClose={onClose} title="Share your feedback" eyebrow="Student Voice">
      <p className="modal-copy">Your suggestions help make study resources better for everyone.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Rating
          <select name="rating" defaultValue="5">
            <option value="5">5 — Excellent</option>
            <option value="4">4 — Good</option>
            <option value="3">3 — Average</option>
            <option value="2">2 — Needs improvement</option>
            <option value="1">1 — Poor</option>
          </select>
        </label>
        <label>
          Your Feedback
          <textarea
            name="message"
            rows={4}
            required
            placeholder="Tell us what you liked or what is missing…"
          />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit Feedback'} <Send size={15} />
        </button>
      </form>
    </Modal>
  );
}

/* ==========================================================================
   8. Contact Support View
   ========================================================================== */
export function ContactView({
  profile,
  requests,
  onRefresh,
  showToast,
}: {
  profile: Profile;
  requests: ContactRequest[];
  onRefresh: () => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Support</p>
          <h1>Contact Us</h1>
          <p className="intro">Send a question or inquiry directly to faculty administrators and track their reply.</p>
        </div>
        <button className="primary-button" onClick={() => setModalOpen(true)}>
          <Plus size={17} /> New message
        </button>
      </section>

      <section className="contact-grid">
        {requests.map((request) => (
          <div className="contact-card" key={request.id}>
            <div className="contact-card-top">
              <span className={`status-chip ${request.status}`}>{request.status.replace('_', ' ')}</span>
              <small>{formatDate(request.created_at)}</small>
            </div>
            <h3>{request.message}</h3>
            <p>
              {request.response
                ? `Response: ${request.response}`
                : 'Your inquiry has been logged. An administrator will reply shortly.'}
            </p>
          </div>
        ))}
        {requests.length === 0 && (
          <EmptyState
            title="No support requests"
            text="Need help with syllabus or materials? Send a message to the department team."
          />
        )}
      </section>

      {modalOpen && (
        <ContactModal
          profile={profile}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await onRefresh();
            showToast('Your inquiry has been submitted.');
          }}
        />
      )}
    </>
  );
}

function ContactModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from('contact_requests').insert({
      user_id: profile.user_id,
      name: profile.name,
      email: profile.email,
      message: form.get('message'),
    });
    setBusy(false);
    if (!error) {
      await onSaved();
    }
  };

  return (
    <Modal onClose={onClose} title="Send Inquiry" eyebrow="Support">
      <p className="modal-copy">Inquiries are sent directly to the course administrators.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Your Message
          <textarea
            name="message"
            rows={5}
            required
            placeholder="Describe your question or issue in detail…"
          />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send Message'} <Send size={15} />
        </button>
      </form>
    </Modal>
  );
}

/* ==========================================================================
   9. Announcements View
   ========================================================================== */
export function AnnouncementsView({
  announcements,
}: {
  announcements: Announcement[];
}) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Notice Board</p>
          <h1>Department Announcements</h1>
          <p className="intro">Important notices, examination schedules, and course updates from your faculty.</p>
        </div>
      </section>

      <section className="announcement-list">
        {announcements.map((item) => (
          <article className="announcement-large" key={item.id}>
            <div className={`announcement-icon ${item.priority}`}>
              <Bell size={18} />
            </div>
            <div>
              <div className="announcement-large-meta">
                <span>{item.priority === 'important' ? 'Priority Notice' : 'General Update'}</span>
                <small>{formatDate(item.published_at)}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
        {announcements.length === 0 && (
          <EmptyState title="No notices published" text="Department notices and updates will appear here." />
        )}
      </section>
    </>
  );
}

/* ==========================================================================
   10. Profile View
   ========================================================================== */
export function ProfileView({
  profile,
  onSaved,
  showToast,
}: {
  profile: Profile;
  onSaved: () => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.get('name'),
        phone: form.get('phone'),
        enrollment_no: form.get('enrollment_no'),
        level: form.get('level'),
      })
      .eq('user_id', profile.user_id);

    setBusy(false);
    if (!error) {
      await onSaved();
      showToast('Profile updated successfully.');
    } else {
      console.error('Profile update failed:', error);
      showToast('Could not save profile changes.');
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Account Details</p>
          <h1>My Profile</h1>
          <p className="intro">Review and update your registered student information.</p>
        </div>
      </section>

      <section className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar-large">{initials(profile.name)}</div>
          <h2>{profile.name}</h2>
          <span>{profile.email}</span>
          <div className="profile-role">
            <ShieldCheck size={14} /> Student Account
          </div>
        </div>

        <form className="panel profile-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Personal Information</p>
              <h3>Edit Details</h3>
            </div>
            <Settings2 size={19} />
          </div>

          <div className="form-two">
            <label>
              Full Name
              <input name="name" defaultValue={profile.name} required />
            </label>
            <label>
              Phone Number
              <input name="phone" defaultValue={profile.phone ?? ''} placeholder="+91 98765 43210" />
            </label>
          </div>

          <div className="form-two">
            <label>
              Email Address
              <input value={profile.email} disabled />
            </label>
            <label>
              Enrollment Number
              <input name="enrollment_no" defaultValue={profile.enrollment_no ?? ''} placeholder="e.g. 2024CS012" />
            </label>
          </div>

          <label>
            Academic Level
            <select name="level" defaultValue={profile.level ?? 'UG'}>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="UG">Undergraduate (UG)</option>
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Saving changes…' : 'Save changes'} <Check size={15} />
          </button>
        </form>
      </section>
    </>
  );
}
