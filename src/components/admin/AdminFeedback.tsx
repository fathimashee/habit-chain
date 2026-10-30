import { useState } from 'react';
import { Star, Trash2, MessageSquareText, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Feedback } from '@/types';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';

function formatDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function AdminFeedback({
  feedback,
  onRefresh,
  showToast,
}: {
  feedback: Feedback[];
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const filtered = feedback.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesRating = ratingFilter === 'All' || item.rating === Number(ratingFilter);
    return matchesStatus && matchesRating;
  });

  const toggleStatus = async (item: Feedback) => {
    const nextStatus = item.status === 'reviewed' ? 'new' : 'reviewed';
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: nextStatus })
        .eq('id', item.id);
      if (error) throw error;
      showToast(`Feedback marked as ${nextStatus}.`);
      await onRefresh();
    } catch (err: unknown) {
      console.error('Update feedback error:', err);
      showToast('Could not update status.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!feedbackToDelete) return;
    setDeleteBusy(true);
    try {
      const { error } = await supabase.from('feedback').delete().eq('id', feedbackToDelete.id);
      if (error) throw error;
      showToast('Feedback record deleted.');
      setFeedbackToDelete(null);
      await onRefresh();
    } catch (err: unknown) {
      console.error('Delete feedback error:', err);
      showToast('Failed to delete feedback.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Student Voice</p>
          <h1>Student Feedback</h1>
          <p className="intro">Review course reviews, ratings, and student suggestions to refine learning resources.</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="filter-select">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status"
          >
            <option value="All">All statuses</option>
            <option value="new">New / Unreviewed</option>
            <option value="reviewed">Reviewed</option>
          </select>
          <ChevronDown size={15} />
        </div>

        <div className="filter-select">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            aria-label="Filter rating"
          >
            <option value="All">All ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      <div className="results-meta">
        <span>{filtered.length} feedback entries</span>
      </div>

      <section className="admin-feedback-grid">
        {filtered.map((item) => (
          <div className="feedback-card" key={item.id}>
            <div className="feedback-card-top">
              <div className="person-cell">
                <div className="mini-avatar">{initials(item.name)}</div>
                <div>
                  <strong>{item.name}</strong>
                  <small>{formatDate(item.created_at)}</small>
                </div>
              </div>
              <span className={`status-chip ${item.status}`}>{item.status}</span>
            </div>

            <div className="rating">
              {Array.from({ length: 5 }, (_, idx) => (
                <Star
                  key={idx}
                  size={14}
                  fill={idx < item.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>

            <p>{item.message}</p>

            <div className="feedback-card-actions">
              <button
                className="outline-button"
                onClick={() => void toggleStatus(item)}
                type="button"
              >
                {item.status === 'reviewed' ? 'Mark New' : 'Mark Reviewed'}
              </button>
              <button
                className="icon-button danger-icon"
                onClick={() => setFeedbackToDelete(item)}
                title="Delete feedback"
                type="button"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon={<MessageSquareText size={26} />}
            title="No feedback found"
            text="Feedback submitted by students will appear in this review panel."
          />
        )}
      </section>

      {feedbackToDelete && (
        <ConfirmModal
          title="Delete Feedback"
          message={`Are you sure you want to delete the feedback from '${feedbackToDelete.name}'?`}
          confirmLabel="Delete Feedback"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onClose={() => setFeedbackToDelete(null)}
        />
      )}
    </>
  );
}
