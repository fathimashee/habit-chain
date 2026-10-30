import { type ReactNode } from 'react';
import {
  Users,
  BookOpen,
  MessageSquareText,
  TrendingUp,
  TrendingDown,
  Upload,
  ArrowRight,
  Star,
  FileText,
  ShieldCheck,
  Check,
  Download,
  UserRound,
  FlaskConical,
  Layers,
} from 'lucide-react';
import type { AppData, AdminView } from '@/types';
import { EmptyState } from '@/components/common/EmptyState';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function daysAgo(value: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
}

export function AdminDashboardOverview({
  data,
  navigate,
}: {
  data: AppData;
  navigate: (view: AdminView) => void;
}) {
  const students = data.profiles.filter((p) => p.role === 'student');
  const activeStudents = students.filter((p) => !p.is_disabled);
  const disabledStudents = students.filter((p) => p.is_disabled);
  const openContacts = data.contacts.filter((c) => c.status === 'open');
  const newFeedback = data.feedback.filter((f) => f.status === 'new');

  const questionPapers = data.materials.filter((m) => m.type === 'question_paper');
  const labMaterials = data.materials.filter((m) => m.type === 'lab');
  const notesCount = data.materials.filter((m) => m.type === 'note').length;
  const guidesCount = data.materials.filter((m) => m.type === 'guide').length;

  // Distinct modules count across subjects
  const distinctModules = new Set(data.subjects.map((s) => s.module).filter(Boolean));

  const avgRating =
    data.feedback.length > 0
      ? (data.feedback.reduce((sum, f) => sum + f.rating, 0) / data.feedback.length).toFixed(1)
      : '5.0';

  const recentUploads = [...data.materials]
    .sort((a, b) => b.upload_date.localeCompare(a.upload_date))
    .slice(0, 5);

  const materialTypes = {
    note: notesCount,
    question_paper: questionPapers.length,
    lab: labMaterials.length,
    guide: guidesCount,
  };
  const maxTypeCount = Math.max(...Object.values(materialTypes), 1);

  return (
    <>
      {/* Hero control center */}
      <section className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-kicker">
            <span className="pulse-dot" /> Academic Management System
          </div>
          <h1>Platform Administration</h1>
          <p>
            Monitor learning materials, student engagement, course subjects, and feedback across all semesters.
          </p>
          <div className="admin-hero-actions">
            <button className="light-button" onClick={() => navigate('upload')} type="button">
              <Upload size={16} /> Upload materials
            </button>
            <button className="light-button" onClick={() => navigate('materials')} type="button">
              <BookOpen size={16} /> Manage repository
            </button>
          </div>
        </div>
        <div className="admin-hero-graphic">
          <div className="admin-hero-ring admin-hero-ring-1" />
          <div className="admin-hero-ring admin-hero-ring-2" />
          <div className="admin-hero-core">
            <ShieldCheck size={36} />
          </div>
          <div className="admin-hero-float admin-hero-float-1">
            <Check size={13} /> {activeStudents.length} active students
          </div>
          <div className="admin-hero-float admin-hero-float-2">
            <BookOpen size={13} /> {data.materials.length} resources
          </div>
        </div>
      </section>

      {/* KPI Cards: 5 Key Metrics */}
      <section className="admin-kpi-grid">
        <KPICard
          icon={<Users size={20} />}
          label="Total Registered Students"
          value={students.length}
          sublabel={`${activeStudents.length} active · ${disabledStudents.length} disabled`}
          tone="blue"
          trend="up"
          trendValue="Enrolled students"
        />
        <KPICard
          icon={<BookOpen size={20} />}
          label="Study Materials"
          value={data.materials.length}
          sublabel={`${notesCount} notes · ${guidesCount} guides`}
          tone="mint"
          trend="up"
          trendValue="Repository total"
        />
        <KPICard
          icon={<FileText size={20} />}
          label="Question Papers"
          value={questionPapers.length}
          sublabel="Past examination papers"
          tone="amber"
          trend="up"
          trendValue="Exam archives"
        />
        <KPICard
          icon={<FlaskConical size={20} />}
          label="Lab Resources & Programs"
          value={labMaterials.length}
          sublabel="Manuals, code & exercises"
          tone="coral"
          trend="up"
          trendValue="Practical resources"
        />
        <KPICard
          icon={<Layers size={20} />}
          label="Subjects & Modules"
          value={`${data.subjects.length} / ${distinctModules.size}`}
          sublabel="Subjects / Unique modules"
          tone="blue"
          trend="flat"
          trendValue="8 Semesters mapped"
        />
      </section>

      {/* Middle row: Material Breakdown & Quick Action Shortcuts */}
      <section className="admin-row admin-row-2col">
        <div className="panel admin-material-breakdown">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Content Library</p>
              <h3>Materials by Category</h3>
            </div>
            <button className="text-button" onClick={() => navigate('materials')} type="button">
              View all <ArrowRight size={15} />
            </button>
          </div>
          <div className="admin-bar-chart">
            <BarRow
              label="Lecture Notes"
              icon={<BookOpen size={14} />}
              count={materialTypes.note}
              max={maxTypeCount}
              color="var(--admin-bar-blue)"
            />
            <BarRow
              label="Question Papers"
              icon={<FileText size={14} />}
              count={materialTypes.question_paper}
              max={maxTypeCount}
              color="var(--admin-bar-mint)"
            />
            <BarRow
              label="Lab Manuals & Code"
              icon={<FlaskConical size={14} />}
              count={materialTypes.lab}
              max={maxTypeCount}
              color="var(--admin-bar-coral)"
            />
            <BarRow
              label="Study Guides"
              icon={<FileText size={14} />}
              count={materialTypes.guide}
              max={maxTypeCount}
              color="var(--admin-bar-amber)"
            />
          </div>
        </div>

        <div className="panel admin-actions-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quick Navigation</p>
              <h3>Administrative Actions</h3>
            </div>
          </div>
          <div className="admin-action-grid">
            <ActionTile
              icon={<Upload size={20} />}
              title="Upload Materials"
              subtitle="Notes, papers, or lab manuals"
              onClick={() => navigate('upload')}
              tone="blue"
            />
            <ActionTile
              icon={<Layers size={20} />}
              title="Semesters & Modules"
              subtitle="Organize curriculum"
              onClick={() => navigate('semesters')}
              tone="mint"
            />
            <ActionTile
              icon={<FileText size={20} />}
              title="Question Papers"
              subtitle={`${questionPapers.length} papers cataloged`}
              onClick={() => navigate('papers')}
              tone="amber"
            />
            <ActionTile
              icon={<FlaskConical size={20} />}
              title="Lab Manuals & Programs"
              subtitle={`${labMaterials.length} lab exercises`}
              onClick={() => navigate('labs')}
              tone="coral"
            />
            <ActionTile
              icon={<Users size={20} />}
              title="Manage Students"
              subtitle={`${students.length} registered accounts`}
              onClick={() => navigate('users')}
              tone="blue"
            />
            <ActionTile
              icon={<MessageSquareText size={20} />}
              title="Student Feedback"
              subtitle={`${newFeedback.length} new reviews`}
              onClick={() => navigate('feedback')}
              tone="mint"
            />
          </div>
        </div>
      </section>

      {/* Third row: Recent uploads timeline + Recent student registrations */}
      <section className="admin-row admin-row-2col">
        <div className="panel admin-timeline-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Activity Feed</p>
              <h3>Recent Uploads</h3>
            </div>
            <button className="text-button" onClick={() => navigate('materials')} type="button">
              Repository <ArrowRight size={15} />
            </button>
          </div>
          <div className="admin-timeline">
            {recentUploads.map((mat) => {
              const diffDays = daysAgo(mat.upload_date);
              const timeLabel = diffDays === 0 ? 'Today' : `${diffDays}d ago`;
              return (
                <div className="admin-timeline-item" key={mat.id}>
                  <div className="admin-timeline-dot" />
                  <div className="admin-timeline-content">
                    <div className="admin-timeline-header">
                      <strong>{mat.title}</strong>
                      <span className="admin-timeline-time">{timeLabel}</span>
                    </div>
                    <div className="admin-timeline-meta">
                      <span className="status-chip neutral">
                        {mat.type === 'question_paper'
                          ? 'Question Paper'
                          : mat.type === 'lab'
                          ? 'Lab Manual'
                          : mat.type.toUpperCase()}
                      </span>
                      <span>
                        <Download size={11} /> {mat.downloads} downloads
                      </span>
                      <span>
                        <FileText size={11} /> {mat.pages} pages
                      </span>
                      <span>{mat.semester ?? 'Semester 1'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {recentUploads.length === 0 && (
              <EmptyState
                icon={<BookOpen size={26} />}
                title="No materials uploaded yet"
                text="Uploaded study materials and question papers will show here."
              />
            )}
          </div>
        </div>

        <div className="panel admin-users-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Registrations</p>
              <h3>Recently Registered Students</h3>
            </div>
            <button className="text-button" onClick={() => navigate('users')} type="button">
              All students <ArrowRight size={15} />
            </button>
          </div>
          <div className="admin-users-table">
            <div className="admin-users-head">
              <span>Student</span>
              <span>Level</span>
              <span>Joined</span>
              <span>Status</span>
            </div>
            {students.slice(0, 5).map((person) => (
              <div className="admin-users-row" key={person.user_id}>
                <div className="person-cell">
                  <div className="mini-avatar">{initials(person.name)}</div>
                  <div>
                    <strong>{person.name}</strong>
                    <small>{person.email}</small>
                  </div>
                </div>
                <span>{person.level ?? 'UG'}</span>
                <span>{formatDate(person.created_at ?? '')}</span>
                <span className={`status-chip ${person.is_disabled ? 'closed' : 'reviewed'}`}>
                  {person.is_disabled ? 'Disabled' : 'Active'}
                </span>
              </div>
            ))}
            {students.length === 0 && (
              <EmptyState
                icon={<UserRound size={26} />}
                title="No registered students"
                text="When students create accounts, they will appear here."
              />
            )}
          </div>
        </div>
      </section>

      {/* Fourth row: Student Feedback & Support Queue */}
      <section className="admin-row admin-row-2col">
        <div className="panel admin-feedback-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Voice of Students (Avg: {avgRating}★)</p>
              <h3>Recent Student Feedback</h3>
            </div>
            <button className="text-button" onClick={() => navigate('feedback')} type="button">
              Review all <ArrowRight size={15} />
            </button>
          </div>
          <div className="admin-feedback-list">
            {data.feedback.slice(0, 4).map((item) => (
              <div className="admin-feedback-row" key={item.id}>
                <div className="mini-avatar">{initials(item.name)}</div>
                <div className="admin-feedback-row-body">
                  <strong>{item.name}</strong>
                  <span>{item.message}</span>
                </div>
                <div className="admin-feedback-rating">
                  {Array.from({ length: 5 }, (_, idx) => (
                    <Star
                      key={idx}
                      size={12}
                      fill={idx < item.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
            ))}
            {data.feedback.length === 0 && (
              <EmptyState
                icon={<MessageSquareText size={26} />}
                title="No feedback received"
                text="Student reviews and ratings will be listed here."
              />
            )}
          </div>
        </div>

        <div className="panel admin-contacts-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Support Queue ({openContacts.length} open)</p>
              <h3>Contact Messages</h3>
            </div>
            <button className="text-button" onClick={() => navigate('contact')} type="button">
              Inbox <ArrowRight size={15} />
            </button>
          </div>
          <div className="admin-contact-list">
            {data.contacts.slice(0, 4).map((req) => (
              <div className="admin-contact-row" key={req.id}>
                <div
                  className={`admin-contact-status-dot ${
                    req.status === 'open' ? 'dot-open' : 'dot-closed'
                  }`}
                />
                <div className="admin-contact-row-body">
                  <strong>{req.name}</strong>
                  <span>{req.message}</span>
                </div>
                <small>{formatDate(req.created_at)}</small>
              </div>
            ))}
            {data.contacts.length === 0 && (
              <EmptyState
                icon={<Check size={26} />}
                title="Support queue empty"
                text="Inquiries submitted by students will appear here."
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function KPICard({
  icon,
  label,
  value,
  sublabel,
  tone,
  trend,
  trendValue,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  tone: string;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
}) {
  return (
    <div className={`admin-kpi-card admin-kpi-${tone}`}>
      <div className="admin-kpi-top">
        <div className="admin-kpi-icon">{icon}</div>
        {trend !== 'flat' && (
          <div className={`admin-kpi-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          </div>
        )}
      </div>
      <div className="admin-kpi-value">{value}</div>
      <div className="admin-kpi-label">{label}</div>
      <div className="admin-kpi-sub">{sublabel}</div>
      <div className="admin-kpi-trend-label">{trendValue}</div>
    </div>
  );
}

function BarRow({
  label,
  icon,
  count,
  max,
  color,
}: {
  label: string;
  icon: ReactNode;
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(8, Math.round((count / max) * 100));
  return (
    <div className="admin-bar-row">
      <div className="admin-bar-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="admin-bar-track">
        <div className="admin-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="admin-bar-count">{count}</div>
    </div>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
  onClick,
  tone,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      className={`admin-action-tile admin-action-${tone}`}
      onClick={onClick}
      type="button"
    >
      <div className="admin-action-tile-icon">{icon}</div>
      <div className="admin-action-tile-body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <ArrowRight size={15} />
    </button>
  );
}
