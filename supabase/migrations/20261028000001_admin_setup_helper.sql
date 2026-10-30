/*
# Admin Setup & Role Management Helper

1. Purpose
- Provides a trusted server-side procedure to assign the 'admin' role to designated administrator emails.
- Preserves existing database records, student roles, and row-level security.
- Prevents unauthenticated or student escalation: only runnable with database admin/service-role privileges.

2. Usage in Supabase SQL Editor:
   SELECT public.promote_user_to_admin('admin@college.edu');
   
   OR direct SQL:
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@college.edu';
*/

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE LOWER(email) = LOWER(TRIM(target_email));
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- Ensure public/anon cannot execute promotion helper
REVOKE EXECUTE ON FUNCTION public.promote_user_to_admin(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(text) TO service_role;
