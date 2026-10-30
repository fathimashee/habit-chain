import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Bell,
  BookOpen,
  ChevronDown,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  UserRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AppData, Profile, StudentView, Subject, Material, Announcement, Feedback, ContactRequest, DownloadRecord } from '@/types';
import {
  StudentOverview,
  MaterialsView,
  SubjectsView,
  PapersView,
  DownloadsView,
  FeedbackView,
  ContactView,
  AnnouncementsView,
  ProfileView,
} from './StudentViews';
import { Toast } from '@/components/common/Toast';

const emptyData: AppData = {
  subjects: [],
  materials: [],
  announcements: [],
  feedback: [],
  contacts: [],
  downloads: [],
  profiles: [],
  payments: [],
  assessments: [],
};

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function viewTitle(view: StudentView): string {
  const map: Record<StudentView, string> = {
    overview: 'Overview',
    materials: 'Study Materials',
    subjects: 'Course Subjects',
    papers: 'Question Papers',
    downloads: 'Download Records',
    feedback: 'Feedback System',
    contact: 'Contact Support',
    announcements: 'Department Notices',
    profile: 'My Profile',
  };
  return map[view] ?? 'Workspace';
}

export function StudentApp({
  profile,
  onSignOut,
}: {
  profile: Profile;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<StudentView>('overview');
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [subjects, materials, announcements, feedback, contacts, downloads] = await Promise.all([
        supabase.from('subjects').select('id,name,code,semester,module,accent').order('name'),
        supabase.from('study_materials').select('id,subject_id,title,description,type,pages,downloads,created_at,semester,module,file_path,upload_date').order('upload_date', { ascending: false }),
        supabase.from('announcements').select('id,title,description,published_at,priority,posted_by').order('published_at', { ascending: false }),
        supabase.from('feedback').select('id,user_id,name,message,rating,status,created_at').eq('user_id', profile.user_id).order('created_at', { ascending: false }),
        supabase.from('contact_requests').select('id,user_id,name,email,message,status,response,created_at').eq('user_id', profile.user_id).order('created_at', { ascending: false }),
        supabase.from('download_records').select('id,action,created_at,material:study_materials(id,subject_id,title,description,type,pages,downloads,created_at,semester,module,file_path,upload_date)').eq('user_id', profile.user_id).order('created_at', { ascending: false }),
      ]);

      setData({
        ...emptyData,
        subjects: (subjects.data ?? []) as Subject[],
        materials: (materials.data ?? []) as Material[],
        announcements: (announcements.data ?? []) as Announcement[],
        feedback: (feedback.data ?? []) as Feedback[],
        contacts: (contacts.data ?? []) as ContactRequest[],
        downloads: (downloads.data ?? []) as unknown as DownloadRecord[],
      });
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  }, [profile.user_id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const navigate = (next: StudentView) => {
    setView(next);
    setMobileOpen(false);
    window.location.hash = `#/${next}`;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={21} />
          </div>
          <span>Habit Chain</span>
        </div>

        <div className="profile-mini">
          <div className="avatar">{initials(profile.name)}</div>
          <div>
            <strong>{profile.name}</strong>
            <span>Student · {profile.level ?? 'UG'}</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className="main-nav">
          <p className="nav-label">Curriculum</p>
          <StudentNavItem
            icon={<LayoutDashboard size={18} />}
            label="Overview"
            active={view === 'overview'}
            onClick={() => navigate('overview')}
          />
          <StudentNavItem
            icon={<BookOpen size={18} />}
            label="Study materials"
            active={view === 'materials'}
            onClick={() => navigate('materials')}
          />
          <StudentNavItem
            icon={<BookOpen size={18} />}
            label="Subjects"
            active={view === 'subjects'}
            onClick={() => navigate('subjects')}
          />
          <StudentNavItem
            icon={<FileText size={18} />}
            label="Question papers"
            active={view === 'papers'}
            onClick={() => navigate('papers')}
          />
          <StudentNavItem
            icon={<Download size={18} />}
            label="Download records"
            active={view === 'downloads'}
            onClick={() => navigate('downloads')}
          />

          <p className="nav-label nav-label-lower">Communication</p>
          <StudentNavItem
            icon={<Bell size={18} />}
            label="Announcements"
            active={view === 'announcements'}
            onClick={() => navigate('announcements')}
          />
          <StudentNavItem
            icon={<MessageSquareText size={18} />}
            label="Feedback"
            active={view === 'feedback'}
            onClick={() => navigate('feedback')}
          />
          <StudentNavItem
            icon={<LifeBuoy size={18} />}
            label="Contact us"
            active={view === 'contact'}
            onClick={() => navigate('contact')}
          />
          <StudentNavItem
            icon={<UserRound size={18} />}
            label="My profile"
            active={view === 'profile'}
            onClick={() => navigate('profile')}
          />
        </nav>

        <div className="sidebar-bottom">
          <div className="streak-card">
            <div className="streak-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>Study Portal</strong>
              <span>Academic session 2026</span>
            </div>
          </div>
          <button className="admin-link" onClick={onSignOut} type="button">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open navigation"
            type="button"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            <span>Student Portal</span>
            <ArrowRight size={14} />
            <strong>{viewTitle(view)}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              aria-label="View announcements"
              onClick={() => navigate('announcements')}
              type="button"
            >
              <Bell size={18} />
              {data.announcements.some((a) => a.priority === 'important') && <i aria-hidden="true" />}
            </button>
            <button
              className="top-avatar"
              onClick={() => navigate('profile')}
              title="My profile"
              aria-label="My profile"
              type="button"
            >
              {initials(profile.name)}
            </button>
          </div>
        </header>

        <div className="content">
          {loading ? (
            <div className="loading-inline">
              <span>Loading your latest course records…</span>
            </div>
          ) : (
            <>
              {view === 'overview' && (
                <StudentOverview profile={profile} data={data} navigate={navigate} />
              )}
              {view === 'materials' && (
                <MaterialsView data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'subjects' && (
                <SubjectsView data={data} navigate={navigate} />
              )}
              {view === 'papers' && (
                <PapersView data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'downloads' && (
                <DownloadsView downloads={data.downloads} showToast={(m) => showToast(m, 'info')} />
              )}
              {view === 'feedback' && (
                <FeedbackView
                  profile={profile}
                  feedback={data.feedback}
                  onRefresh={refresh}
                  showToast={showToast}
                />
              )}
              {view === 'contact' && (
                <ContactView
                  profile={profile}
                  requests={data.contacts}
                  onRefresh={refresh}
                  showToast={showToast}
                />
              )}
              {view === 'announcements' && (
                <AnnouncementsView announcements={data.announcements} />
              )}
              {view === 'profile' && (
                <ProfileView profile={profile} onSaved={refresh} showToast={showToast} />
              )}
            </>
          )}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function StudentNavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
