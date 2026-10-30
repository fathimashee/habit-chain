import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Bell,
  BookOpen,
  FileText,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  AppData,
  Profile,
  AdminView,
  Subject,
  Material,
  Announcement,
  Feedback,
  ContactRequest,
  Payment,
  Assessment,
} from '@/types';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminMaterials } from './AdminMaterials';
import { AdminUploadView } from './AdminUploadView';
import { AdminSubjects } from './AdminSubjects';
import { AdminSemesters } from './AdminSemesters';
import { AdminPapers } from './AdminPapers';
import { AdminLabs } from './AdminLabs';
import { AdminUsers } from './AdminUsers';
import { AdminFeedback } from './AdminFeedback';
import { AdminContacts } from './AdminContacts';
import { AdminSettings } from './AdminSettings';
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

function adminViewTitle(view: AdminView): string {
  const titles: Record<AdminView, string> = {
    dashboard: 'Platform Dashboard',
    materials: 'Manage Study Materials',
    upload: 'Upload Materials',
    subjects: 'Manage Subjects',
    semesters: 'Manage Semesters & Modules',
    papers: 'Manage Question Papers',
    labs: 'Manage Lab Manuals & Programs',
    users: 'Manage Users',
    feedback: 'Student Feedback',
    contact: 'Contact Messages',
    settings: 'Settings & Security',
  };
  return titles[view] ?? 'Admin Console';
}

export function AdminApp({
  profile,
  onSignOut,
}: {
  profile: Profile;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<AdminView>('dashboard');
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [subjects, materials, announcements, feedback, contacts, profiles, payments, assessments] =
        await Promise.all([
          supabase.from('subjects').select('id,name,code,semester,module,accent').order('name'),
          supabase.from('study_materials').select('id,subject_id,title,description,type,pages,downloads,created_at,semester,module,file_path,upload_date').order('upload_date', { ascending: false }),
          supabase.from('announcements').select('id,title,description,published_at,priority,posted_by').order('published_at', { ascending: false }),
          supabase.from('feedback').select('id,user_id,name,message,rating,status,created_at').order('created_at', { ascending: false }),
          supabase.from('contact_requests').select('id,user_id,name,email,message,status,response,created_at').order('created_at', { ascending: false }),
          supabase.from('profiles').select('user_id,name,email,role,enrollment_no,level,phone,is_disabled,created_at').order('created_at', { ascending: false }),
          supabase.from('payments').select('id,payment_id,amount,status,confirmation,created_at,user:profiles(user_id,name,email,role,enrollment_no,level,phone,is_disabled,created_at)').order('created_at', { ascending: false }),
          supabase.from('assessments').select('id,title,semester,assessment_date,status,notes,subject:subjects(id,name,code,semester,module,accent)').order('assessment_date'),
        ]);

      setData({
        ...emptyData,
        subjects: (subjects.data ?? []) as Subject[],
        materials: (materials.data ?? []) as Material[],
        announcements: (announcements.data ?? []) as Announcement[],
        feedback: (feedback.data ?? []) as Feedback[],
        contacts: (contacts.data ?? []) as ContactRequest[],
        profiles: (profiles.data ?? []) as Profile[],
        payments: (payments.data ?? []) as unknown as Payment[],
        assessments: (assessments.data ?? []) as unknown as Assessment[],
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const navigate = (next: AdminView) => {
    setView(next);
    setMobileOpen(false);
    window.location.hash = `#/admin/${next}`;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  // The 11 Navigation Items matching the user requirements (+ Logout action at bottom)
  const navItems: [AdminView, string, ReactNode][] = [
    ['dashboard', 'Dashboard', <LayoutDashboard size={17} />],
    ['materials', 'Manage Study Materials', <BookOpen size={17} />],
    ['upload', 'Upload Materials', <Upload size={17} />],
    ['subjects', 'Manage Subjects', <BookOpen size={17} />],
    ['semesters', 'Manage Semesters and Modules', <Layers size={17} />],
    ['papers', 'Manage Question Papers', <FileText size={17} />],
    ['labs', 'Manage Lab Manuals and Programs', <FlaskConical size={17} />],
    ['users', 'Manage Users', <Users size={17} />],
    ['feedback', 'Student Feedback', <MessageSquareText size={17} />],
    ['contact', 'Contact Messages', <LifeBuoy size={17} />],
    ['settings', 'Settings', <Settings size={17} />],
  ];

  return (
    <div className="app-shell admin-shell">
      <aside className={`sidebar admin-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark admin-brand-mark">
            <GraduationCap size={21} />
          </div>
          <span>Habit Chain</span>
        </div>

        <div className="admin-label">
          <ShieldCheck size={14} /> Administrator Portal
        </div>

        <div className="profile-mini">
          <div className="avatar admin-avatar">{initials(profile.name)}</div>
          <div>
            <strong>{profile.name}</strong>
            <span>Platform Admin</span>
          </div>
        </div>

        <nav className="main-nav">
          <p className="nav-label">Navigation</p>
          {navItems.map(([key, label, icon]) => (
            <AdminNavItem
              key={key}
              icon={icon}
              label={label}
              active={view === key}
              onClick={() => navigate(key)}
            />
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="admin-link logout-btn" onClick={onSignOut} type="button">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open navigation menu"
            type="button"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            <span>Admin Console</span>
            <ArrowRight size={14} />
            <strong>{adminViewTitle(view)}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              aria-label="Student feedback queue"
              onClick={() => navigate('feedback')}
              type="button"
            >
              <Bell size={18} />
              {data.feedback.some((f) => f.status === 'new') && <i aria-hidden="true" />}
            </button>
            <button
              className="top-avatar admin-top-avatar"
              onClick={() => navigate('settings')}
              title="Admin Settings"
              aria-label="Admin Settings"
              type="button"
            >
              {initials(profile.name)}
            </button>
          </div>
        </header>

        <div className="content">
          {loading ? (
            <div className="loading-inline">
              <span>Synchronizing administrator workspace…</span>
            </div>
          ) : (
            <>
              {view === 'dashboard' && (
                <AdminDashboardOverview data={data} navigate={navigate} />
              )}
              {view === 'materials' && (
                <AdminMaterials data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'upload' && (
                <AdminUploadView
                  data={data}
                  onRefresh={refresh}
                  showToast={showToast}
                  onSuccessNavigate={() => navigate('materials')}
                />
              )}
              {view === 'subjects' && (
                <AdminSubjects data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'semesters' && (
                <AdminSemesters data={data} navigate={navigate} />
              )}
              {view === 'papers' && (
                <AdminPapers data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'labs' && (
                <AdminLabs data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'users' && (
                <AdminUsers data={data} onRefresh={refresh} showToast={showToast} />
              )}
              {view === 'feedback' && (
                <AdminFeedback
                  feedback={data.feedback}
                  onRefresh={refresh}
                  showToast={showToast}
                />
              )}
              {view === 'contact' && (
                <AdminContacts
                  contacts={data.contacts}
                  onRefresh={refresh}
                  showToast={showToast}
                />
              )}
              {view === 'settings' && (
                <AdminSettings
                  profile={profile}
                  onRefresh={refresh}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function AdminNavItem({
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
