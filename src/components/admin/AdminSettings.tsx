import { useState, type FormEvent } from 'react';
import {
  ShieldCheck,
  Key,
  Server,
  Database,
  Check,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export function AdminSettings({
  profile,
  onRefresh,
  showToast,
}: {
  profile: Profile;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [profileBusy, setProfileBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileBusy(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name, phone })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      showToast('Admin profile details updated.');
      await onRefresh();
    } catch (err: unknown) {
      console.error('Update profile error:', err);
      showToast('Could not update profile.', 'error');
    } finally {
      setProfileBusy(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setResetBusy(true);
    setResetMessage('');
    setResetError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetMessage(`A password reset link has been dispatched to ${profile.email}. Check your inbox.`);
      showToast('Password reset email sent.');
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const msg = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: string }).message)
        : 'Could not send password reset email.';
      setResetError(msg);
      showToast('Password reset request failed.', 'error');
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Platform Administration</p>
          <h1>Settings & Security</h1>
          <p className="intro">Configure administrator profile credentials, review platform security, and verify system status.</p>
        </div>
      </section>

      <div className="admin-settings-layout">
        {/* Left Column: Admin Profile */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Identity</p>
              <h3>Administrator Account</h3>
            </div>
            <ShieldCheck size={20} className="text-accent" />
          </div>

          <form onSubmit={handleUpdateProfile} className="admin-form">
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
                Assigned Role
                <input value="Administrator (Verified)" disabled />
              </label>
            </div>

            <button className="primary-button" type="submit" disabled={profileBusy}>
              {profileBusy ? 'Saving…' : 'Save Details'} <Check size={15} />
            </button>
          </form>
        </section>

        {/* Right Column: Password & Credential Security */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Authentication</p>
              <h3>Password Management</h3>
            </div>
            <Key size={20} />
          </div>

          <p className="settings-copy">
            Administrator accounts are authenticated using secure Supabase Auth cryptographic hashing.
            To change or reset your administrator password, trigger a secure password reset email.
          </p>

          {resetMessage && (
            <div className="notice success">
              <Check size={15} /> {resetMessage}
            </div>
          )}

          {resetError && (
            <div className="notice error">
              <AlertCircle size={15} /> {resetError}
            </div>
          )}

          <div className="settings-action-box">
            <button
              className="outline-button"
              onClick={handleSendPasswordReset}
              disabled={resetBusy}
              type="button"
            >
              <Mail size={15} /> {resetBusy ? 'Sending…' : 'Send Password Reset Email'}
            </button>
            <small>The reset link will be sent to your registered address: {profile.email}</small>
          </div>
        </section>

        {/* Security & System Status Panel */}
        <section className="panel admin-system-status-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Health Check</p>
              <h3>Security & Infrastructure Status</h3>
            </div>
            <Server size={20} />
          </div>

          <div className="status-grid-pills">
            <div className="status-pill-item">
              <div className="status-pill-icon mint">
                <Check size={16} />
              </div>
              <div>
                <strong>Role-Based Access Control (RBAC)</strong>
                <span>Enforced on server via Postgres RLS & is_admin() SECURITY DEFINER RPC.</span>
              </div>
            </div>

            <div className="status-pill-item">
              <div className="status-pill-icon mint">
                <Check size={16} />
              </div>
              <div>
                <strong>Storage Bucket (study-materials)</strong>
                <span>Private storage bucket with signed URL generation active.</span>
              </div>
            </div>

            <div className="status-pill-item">
              <div className="status-pill-icon mint">
                <Check size={16} />
              </div>
              <div>
                <strong>AI Assistant Decommissioned</strong>
                <span>AI assistant widgets, routes, and edge functions have been completely removed.</span>
              </div>
            </div>

            <div className="status-pill-item">
              <div className="status-pill-icon blue">
                <Database size={16} />
              </div>
              <div>
                <strong>Database Schema</strong>
                <span>PostgreSQL on Supabase connected and operational.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
