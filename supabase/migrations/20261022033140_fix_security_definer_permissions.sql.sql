/*
# Fix SECURITY DEFINER function permissions and search_path

## Why
The database security linter flagged 3 issues:
1. `auto_confirm_user()` — callable by anon and authenticated via REST API. This is a
   trigger function that should only fire on INSERT to auth.users, never be called
   directly. Revoke EXECUTE from all roles except service_role.
2. `update_conversation_timestamp()` — callable by anon and authenticated, and has a
   mutable search_path. This is a trigger function; revoke EXECUTE from anon and
   authenticated, and set an explicit search_path.
3. `is_admin()` — callable by anon. This function checks admin status and is needed
   by authenticated users (in RLS policies). Revoke from anon only; keep for
   authenticated.

## Changes
1. REVOKE EXECUTE on `auto_confirm_user()` from anon and authenticated.
2. REVOKE EXECUTE on `update_conversation_timestamp()` from anon and authenticated,
   and recreate with `SET search_path = public, auth`.
3. REVOKE EXECUTE on `is_admin()` from anon (keep authenticated grant).
*/

REVOKE EXECUTE ON FUNCTION public.auto_confirm_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_conversation_timestamp() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;