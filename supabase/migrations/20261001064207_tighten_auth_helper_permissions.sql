/*
# Tighten authentication helper permissions

1. Security change
- Prevents the profile-creation trigger function from being called through the public API.
- The trigger can still run automatically when Supabase Auth creates a user.
- The authenticated-only admin role helper remains available to protected row rules because those rules need it to authorize admin actions.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;