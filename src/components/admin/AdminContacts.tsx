import { useState, type FormEvent } from 'react';
import { LifeBuoy, MessageSquare, Trash2, Send, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ContactRequest } from '@/types';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';

function formatDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function AdminContacts({
  contacts,
  onRefresh,
  showToast,
}: {
  contacts: ContactRequest[];
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [replyingTo, setReplyingTo] = useState<ContactRequest | null>(null);
  const [contactToDelete, setContactToDelete] = useState<ContactRequest | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const filtered = contacts.filter((c) => {
    return statusFilter === 'All' || c.status === statusFilter;
  });

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setDeleteBusy(true);
    try {
      const { error } = await supabase.from('contact_requests').delete().eq('id', contactToDelete.id);
      if (error) throw error;
      showToast('Support ticket deleted.');
      setContactToDelete(null);
      await onRefresh();
    } catch (err: unknown) {
      console.error('Delete contact failed:', err);
      showToast('Could not delete support request.', 'error');
    } finally {
      setDeleteBusy(false);
    }
  };

  const updateStatus = async (item: ContactRequest, nextStatus: 'open' | 'in_progress' | 'closed') => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status: nextStatus })
        .eq('id', item.id);
      if (error) throw error;
      showToast(`Request marked as ${nextStatus.replace('_', ' ')}.`);
      await onRefresh();
    } catch (err: unknown) {
      console.error('Update status failed:', err);
      showToast('Could not update status.', 'error');
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic Support</p>
          <h1>Contact Messages</h1>
          <p className="intro">Respond to student inquiries, syllabus questions, and material requests.</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="filter-select">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status"
          >
            <option value="All">All Inquiries</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed / Resolved</option>
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      <div className="results-meta">
        <span>{filtered.length} inquiries found</span>
      </div>

      <section className="admin-feedback-grid">
        {filtered.map((item) => (
          <div className="feedback-card" key={item.id}>
            <div className="feedback-card-top">
              <div>
                <strong>{item.name}</strong>
                <small className="contact-email">{item.email} · {formatDate(item.created_at)}</small>
              </div>
              <span className={`status-chip ${item.status}`}>{item.status.replace('_', ' ')}</span>
            </div>

            <p>{item.message}</p>

            {item.response && (
              <div className="contact-response-box">
                <strong>Faculty Response:</strong>
                <p>{item.response}</p>
              </div>
            )}

            <div className="contact-actions-bar">
              <button
                className="primary-button contact-reply-btn"
                onClick={() => setReplyingTo(item)}
                type="button"
              >
                <MessageSquare size={14} /> {item.response ? 'Edit Reply' : 'Send Reply'}
              </button>

              <button
                className="outline-button"
                onClick={() =>
                  void updateStatus(item, item.status === 'closed' ? 'open' : 'closed')
                }
                type="button"
              >
                {item.status === 'closed' ? 'Reopen' : 'Mark Resolved'}
              </button>

              <button
                className="icon-button danger-icon"
                onClick={() => setContactToDelete(item)}
                title="Delete message"
                type="button"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon={<LifeBuoy size={26} />}
            title="No support inquiries found"
            text="Questions submitted by students via the contact form will appear here."
          />
        )}
      </section>

      {/* Reply Modal */}
      {replyingTo && (
        <ContactReplyModal
          contact={replyingTo}
          onClose={() => setReplyingTo(null)}
          onSaved={async () => {
            setReplyingTo(null);
            await onRefresh();
            showToast('Response recorded and sent to student.');
          }}
        />
      )}

      {/* Delete Modal */}
      {contactToDelete && (
        <ConfirmModal
          title="Delete Inquiry"
          message={`Are you sure you want to permanently delete the inquiry from '${contactToDelete.name}'?`}
          confirmLabel="Delete Inquiry"
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onClose={() => setContactToDelete(null)}
        />
      )}
    </>
  );
}

function ContactReplyModal({
  contact,
  onClose,
  onSaved,
}: {
  contact: ContactRequest;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const responseText = String(form.get('response') ?? '').trim();

    const { error } = await supabase
      .from('contact_requests')
      .update({
        response: responseText,
        status: 'closed',
      })
      .eq('id', contact.id);

    setBusy(false);
    if (!error) {
      await onSaved();
    }
  };

  return (
    <Modal onClose={onClose} title={`Reply to ${contact.name}`} eyebrow="Academic Support">
      <div className="inquiry-context-box">
        <strong>Student Question:</strong>
        <p>{contact.message}</p>
        <small>{contact.email}</small>
      </div>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Your Faculty Response
          <textarea
            name="response"
            rows={5}
            defaultValue={contact.response ?? ''}
            required
            placeholder="Type your answer or instructions for the student…"
          />
        </label>
        <div className="modal-actions-bar">
          <button type="button" className="outline-button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save Response & Close'} <Send size={15} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
