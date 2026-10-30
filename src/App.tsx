import { useEffect, useState } from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Profile, Role } from '@/types';
import { fetchProfileWithRetry, resolveVerifiedRole, safeSignOut } from '@/lib/auth';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { StudentApp } from '@/components/student/StudentApp';
import { AdminApp } from '@/components/admin/AdminApp';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verifiedRole, setVerifiedRole] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [unauthorizedNotice, setUnauthorizedNotice] = useState(false);

  // Synchronize authentication and enforce server-verified role-based access control
  useEffect(() => {
    let isMounted = true;

    const syncUserSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!isMounted) return;

        const currentSession = sessionData.session;
        setSession(currentSession);

        if (currentSession?.user) {
          const userProfile = await fetchProfileWithRetry(currentSession.user);
          if (!isMounted) return;

          if (userProfile) {
            setProfile(userProfile);
            const role = await resolveVerifiedRole(userProfile);
            if (!isMounted) return;
            setVerifiedRole(role);

            // URL route protection
            const currentHash = window.location.hash;
            if (role === 'student' && currentHash.startsWith('#/admin')) {
              console.warn('Security: Student attempted to access admin route. Redirecting to student overview.');
              setUnauthorizedNotice(true);
              window.location.hash = '#/overview';
            } else if (role === 'admin' && (!currentHash || currentHash === '#/login' || currentHash === '#/overview')) {
              window.location.hash = '#/admin/dashboard';
            }
          } else {
            setProfile(null);
            setVerifiedRole(null);
          }
        } else {
          setProfile(null);
          setVerifiedRole(null);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    void syncUserSession();

    // Listen to Auth State changes cleanly
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT' || !nextSession) {
        setSession(null);
        setProfile(null);
        setVerifiedRole(null);
        setAuthLoading(false);
        return;
      }

      setSession(nextSession);
      // Asynchronously fetch profile and verify server role
      void (async () => {
        if (nextSession.user) {
          const userProfile = await fetchProfileWithRetry(nextSession.user);
          if (userProfile) {
            setProfile(userProfile);
            const role = await resolveVerifiedRole(userProfile);
            setVerifiedRole(role);

            // Routing guard on login / refresh
            const currentHash = window.location.hash;
            if (role === 'student' && currentHash.startsWith('#/admin')) {
              window.location.hash = '#/overview';
            } else if (role === 'admin' && (!currentHash || currentHash === '#/login' || currentHash === '#/overview')) {
              window.location.hash = '#/admin/dashboard';
            }
          }
        }
      })();
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setProfile(null);
    setVerifiedRole(null);
    setSession(null);
    await safeSignOut();
  };

  if (authLoading) {
    return <LoadingScreen label="Verifying credentials & workspace" />;
  }

  if (!session || !profile || !verifiedRole) {
    return <AuthScreen error={authError} setError={setAuthError} />;
  }

  if (profile.is_disabled) {
    return <DisabledScreen onSignOut={handleSignOut} />;
  }

  // Double-check: Even if client state was modified, verifiedRole was confirmed via server RPC
  if (verifiedRole === 'admin') {
    return <AdminApp profile={profile} onSignOut={handleSignOut} />;
  }

  return (
    <>
      {unauthorizedNotice && (
        <div className="security-banner" role="alert">
          <span>Access Denied: Administrator privileges required to access that route. Redirected to your student workspace.</span>
          <button onClick={() => setUnauthorizedNotice(false)} type="button">Dismiss</button>
        </div>
      )}
      <StudentApp profile={profile} onSignOut={handleSignOut} />
    </>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="center-screen">
      <div className="loading-mark">
        <GraduationCap size={26} />
      </div>
      <strong>{label}</strong>
      <span>Please wait a moment…</span>
    </div>
  );
}

function DisabledScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="center-screen">
      <div className="loading-mark warning">
        <ShieldCheck size={26} />
      </div>
      <h2>Account Access Paused</h2>
      <span>Your account access has been paused. Please contact faculty administration for assistance.</span>
      <button className="outline-button" onClick={onSignOut} type="button">
        Sign out
      </button>
    </div>
  );
}

export default App;
