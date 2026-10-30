import { useState, type FormEvent } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthScreenProps {
  error: string;
  setError: (value: string) => void;
  onSuccess?: () => void;
}

export function AuthScreen({ error, setError, onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (mode === 'register' && password.length < 12) {
      setError('Use a password with at least 12 characters. Avoid common or previously leaked passwords.');
      setBusy(false);
      return;
    }

    try {
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setMessage('If that email is registered, password reset instructions are on the way.');
      } else if (mode === 'register') {
        const name = String(form.get('name') ?? 'Student');
        const level = String(form.get('level') ?? 'UG');
        const phone = String(form.get('phone') ?? '');

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              level,
              phone,
            },
          },
        });
        if (signUpError) throw signUpError;

        setMessage('Your student account is ready. Signing you in…');
        // Automatically try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setMessage('Your account is ready. Please sign in with your credentials.');
          setMode('login');
        } else if (onSuccess) {
          onSuccess();
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (onSuccess) onSuccess();
      }
    } catch (caught: unknown) {
      console.error('Authentication error:', caught);
      const authCode = typeof caught === 'object' && caught !== null && 'code' in caught ? String((caught as { code: unknown }).code) : '';
      const authMessage = typeof caught === 'object' && caught !== null && 'message' in caught ? String((caught as { message: unknown }).message) : '';

      setError(
        authCode === 'weak_password'
          ? 'That password has appeared in a public data breach. Choose a unique passphrase with at least 12 characters.'
          : authCode === 'invalid_credentials'
          ? 'Email or password is incorrect. Please check your credentials and try again.'
          : authCode === 'email_not_confirmed'
          ? 'Please confirm your email before signing in.'
          : authCode === 'user_not_found'
          ? 'No account found with that email. Please create a student account first.'
          : authCode === 'over_rate_limit'
          ? 'Too many login attempts. Please wait a moment and try again.'
          : authMessage || 'We could not complete that request. Check your details and try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-brand">
          <div className="brand-mark">
            <GraduationCap size={21} />
          </div>
          <span>Habit Chain</span>
        </div>

        <div className="auth-art-copy">
          <span className="auth-overline">LEARN · GROW · TOGETHER</span>
          <h1>
            Build a habit<br />
            <em>that takes you further.</em>
          </h1>
          <p>
            One focused session at a time. Keep your materials close, your goals clear, and your learning moving forward.
          </p>
          <div className="auth-quote">
            <Sparkles size={17} />
            <span>“Consistency is the quiet engine behind every breakthrough.”</span>
          </div>
        </div>

        <div className="auth-orbit">
          <div />
          <div />
          <BookOpen size={40} />
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-mobile-brand">
          <div className="brand-mark">
            <GraduationCap size={21} />
          </div>
          <span>Habit Chain</span>
        </div>

        {mode !== 'forgot' && (
          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => {
                setMode('login');
                setError('');
                setMessage('');
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => {
                setMode('register');
                setError('');
                setMessage('');
              }}
              type="button"
            >
              Create account
            </button>
          </div>
        )}

        <p className="eyebrow">
          {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Start your journey' : 'Account recovery'}
        </p>

        <h2>
          {mode === 'login'
            ? 'Good to see you.'
            : mode === 'register'
            ? 'Make learning a habit.'
            : 'Reset your password.'}
        </h2>

        <p className="auth-copy">
          {mode === 'login'
            ? 'Sign in to access study materials and examination archives.'
            : mode === 'register'
            ? 'Create your student account in under a minute.'
            : 'Enter your email and we’ll send a secure reset link.'}
        </p>

        {message && (
          <div className="notice success" role="status">
            <Check size={15} />
            {message}
          </div>
        )}

        {error && (
          <div className="notice error">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <>
              <label>
                Full name
                <input name="name" placeholder="Alex Robinson" required />
              </label>
              <label>
                Academic Level
                <select name="level" defaultValue="UG">
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard</option>
                  <option value="UG">Undergraduate (UG)</option>
                </select>
              </label>
            </>
          )}

          <label>
            Email address
            <input name="email" type="email" placeholder="you@college.edu" required />
          </label>

          <div className={mode === 'forgot' ? 'hidden' : ''}>
            {mode === 'register' && (
              <label>
                Phone number
                <input name="phone" placeholder="+91 98765 43210" required />
              </label>
            )}

            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder="Use a unique passphrase"
                required={mode !== 'forgot'}
              />
            </label>

            {mode === 'register' && (
              <small className="field-hint">
                Use 12 or more characters. Passwords are protected with secure cryptographic hashing.
              </small>
            )}
          </div>

          {mode === 'login' && (
            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setMode('forgot');
                setError('');
                setMessage('');
              }}
            >
              Forgot password?
            </button>
          )}

          <button className="primary-button auth-submit" disabled={busy} type="submit">
            {busy
              ? 'Please wait…'
              : mode === 'forgot'
              ? 'Send reset link'
              : mode === 'register'
              ? 'Create student account'
              : 'Sign in'}
            <ArrowRight size={16} />
          </button>
        </form>

        {mode === 'forgot' && (
          <button
            className="back-link"
            onClick={() => {
              setMode('login');
              setError('');
              setMessage('');
            }}
            type="button"
          >
            Back to sign in
          </button>
        )}

        <p className="auth-footer">
          By signing in, you agree to access Habit Chain for educational purposes.
        </p>
      </div>
    </div>
  );
}
