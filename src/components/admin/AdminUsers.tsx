import { useState, useMemo } from 'react';
import { Search, ChevronDown, UserRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AppData, Profile } from '@/types';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';

const PAGE_SIZE = 10;

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function AdminUsers({
  data,
  onRefresh,
  showToast,
}: {
  data: AppData;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All levels');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [currentPage, setCurrentPage] = useState(1);

  const [userToToggle, setUserToToggle] = useState<Profile | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);

  const students = data.profiles.filter((p) => p.role === 'student');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = `${s.name} ${s.email} ${s.enrollment_no ?? ''} ${s.phone ?? ''}`.toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());
      const matchesLevel = levelFilter === 'All levels' || s.level === levelFilter;
      const matchesStatus =
        statusFilter === 'All status' ||
        (statusFilter === 'active' && !s.is_disabled) ||
        (statusFilter === 'disabled' && s.is_disabled);

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [students, search, levelFilter, statusFilter]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    setToggleBusy(true);
    const nextStatus = !userToToggle.is_disabled;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_disabled: nextStatus })
        .eq('user_id', userToToggle.user_id);

      if (error) throw error;
      showToast(
        `Student '${userToToggle.name}' account has been ${nextStatus ? 'disabled' : 'activated'}.`
      );
      setUserToToggle(null);
      await onRefresh();
    } catch (err: unknown) {
      console.error('Toggle user failed:', err);
      showToast('Could not update user status.', 'error');
    } finally {
      setToggleBusy(false);
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">User Directory</p>
          <h1>Manage Students</h1>
          <p className="intro">
            Monitor registered student profiles, verify enrollment credentials, and manage platform access.
          </p>
        </div>
      </section>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, email, or enrollment no…"
            aria-label="Search students"
          />
        </div>

        <div className="filter-select">
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by level"
          >
            <option>All levels</option>
            <option value="10th">10th Standard</option>
            <option value="12th">12th Standard</option>
            <option value="UG">Undergraduate (UG)</option>
          </select>
          <ChevronDown size={15} />
        </div>

        <div className="filter-select">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
          >
            <option>All status</option>
            <option value="active">Active Accounts</option>
            <option value="disabled">Disabled Accounts</option>
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      <div className="results-meta">
        <span>{filteredStudents.length} students found</span>
      </div>

      <section className="panel table-panel">
        <div className="table-head admin-users-head-full">
          <span>Student</span>
          <span>Level</span>
          <span>Enrollment No</span>
          <span>Contact</span>
          <span>Joined Date</span>
          <span>Access Status</span>
        </div>

        {paginatedStudents.map((person) => (
          <div className="table-row admin-users-row-full" key={person.user_id}>
            <div className="person-cell">
              <div className="mini-avatar">{initials(person.name)}</div>
              <div>
                <strong>{person.name}</strong>
                <small>{person.email}</small>
              </div>
            </div>

            <span>{person.level ?? 'UG'}</span>

            <span>{person.enrollment_no || '—'}</span>

            <span>{person.phone || '—'}</span>

            <span>{formatDate(person.created_at)}</span>

            <div>
              <button
                className={`status-chip-btn ${person.is_disabled ? 'closed' : 'reviewed'}`}
                onClick={() => setUserToToggle(person)}
                title={person.is_disabled ? 'Click to activate account' : 'Click to disable account'}
                type="button"
              >
                {person.is_disabled ? (
                  <>
                    <ShieldAlert size={12} /> Disabled
                  </>
                ) : (
                  <>
                    <ShieldCheck size={12} /> Active
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {paginatedStudents.length === 0 && (
          <EmptyState
            icon={<UserRound size={26} />}
            title="No students match the selected filters"
            text="Try clearing the search query or changing your status selection."
          />
        )}
      </section>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredStudents.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      {userToToggle && (
        <ConfirmModal
          title={userToToggle.is_disabled ? 'Activate Student Account' : 'Pause Student Access'}
          message={
            userToToggle.is_disabled
              ? `Re-enable account access for '${userToToggle.name}'? They will be able to sign in and access study materials.`
              : `Disable account access for '${userToToggle.name}'? Their session will be paused until re-activated.`
          }
          confirmLabel={userToToggle.is_disabled ? 'Activate Account' : 'Disable Account'}
          isDestructive={!userToToggle.is_disabled}
          busy={toggleBusy}
          onConfirm={confirmToggleStatus}
          onClose={() => setUserToToggle(null)}
        />
      )}
    </>
  );
}
