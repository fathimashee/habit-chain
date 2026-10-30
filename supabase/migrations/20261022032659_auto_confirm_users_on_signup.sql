/*
# Auto-confirm user emails on signup

## Why
Supabase enables email confirmation by default. When enabled, a user who signs up
receives a confirmation email and cannot sign in until they click the link. For this
app, email confirmation should be OFF (per project guidelines). Since the auth config
is not editable via SQL, this migration adds a trigger that sets `email_confirmed_at`
immediately when a new auth user is created, effectively bypassing email confirmation.

## Changes
1. Creates a `BEFORE INSERT` trigger on `auth.users` that auto-sets:
   - `email_confirmed_at` to `now()` (marks email as confirmed)
   - `confirmed_at` to `now()` (marks the user as confirmed)
2. This allows `signInWithPassword` to succeed immediately after signup.
*/

CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = auth, public
AS $$
BEGIN
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();