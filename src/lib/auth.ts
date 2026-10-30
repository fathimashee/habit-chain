import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, Role } from '@/types';

/**
 * Fetch profile with retry to prevent race conditions during new user signup trigger.
 */
export async function fetchProfileWithRetry(user: User, retries = 3, delayMs = 400): Promise<Profile | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, role, enrollment_no, level, phone, is_disabled, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn(`Profile fetch attempt ${attempt + 1} error:`, error.message);
      }

      if (data) {
        return data as Profile;
      }
    } catch (err) {
      console.warn(`Profile fetch attempt ${attempt + 1} exception:`, err);
    }

    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

/**
 * Verify whether the currently authenticated user actually has admin rights on the server
 * by executing the SECURITY DEFINER RPC `is_admin()`.
 * This prevents any client-side tampering with local storage or state.
 */
export async function verifyAdminServer(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.warn('Server admin verification check returned error:', error.message);
      return false;
    }
    return Boolean(data);
  } catch (err) {
    console.error('Server admin verification failed:', err);
    return false;
  }
}

/**
 * Validates the role reliably against both profile record and server RPC.
 */
export async function resolveVerifiedRole(profile: Profile): Promise<Role> {
  if (profile.role === 'admin') {
    const isActuallyAdmin = await verifyAdminServer();
    if (!isActuallyAdmin) {
      console.warn('Security Alert: User claimed admin role but failed server-side verification. Falling back to student.');
      return 'student';
    }
    return 'admin';
  }
  return 'student';
}

/**
 * Clean sign out that purges any session tokens and resets URL navigation.
 */
export async function safeSignOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out warning:', err);
  } finally {
    // Clear any lingering session state
    try {
      window.sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.hash = '';
  }
}
