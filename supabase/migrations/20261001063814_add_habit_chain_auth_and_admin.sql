/*
# Add authenticated Habit Chain platform

1. New Tables and fields
- `profiles`: one protected student or admin profile per Supabase Auth user, including name, email, enrollment number, level, phone, role, and disabled status.
- `download_records`: private history of materials viewed or downloaded by a student.
- `payments`: admin-managed payment records with amount, status, and confirmation.
- `assessments`: admin-managed academic assessment records.
- `study_materials`: adds semester, module, uploaded_by, file_path, and upload_date for complete content management.
- `announcements`: adds posted_by for administrator attribution.
- `feedback` and `contact_requests`: add authenticated user ownership.

2. Authentication and roles
- A trigger creates a student profile after Supabase Auth registration.
- Roles live in the protected `profiles.role` column and are never accepted from the browser during signup.
- The `is_admin()` function is a server-side role check for protected admin actions.

3. Security
- Replaces the earlier shared/public policies with authenticated-only policies.
- Students can access their own profile, feedback, contact requests, and download history.
- Students can read published subjects, materials, announcements, and create feedback/contact requests.
- Only admins can create, edit, or delete academic content, users, announcements, payments, and assessments.
- Study material files use a private storage bucket with authenticated read access and admin-only upload/update/delete.
*/

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Student',
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  enrollment_no text,
  level text CHECK (level IN ('10th', '12th', 'UG')),
  phone text,
  is_disabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS semester text;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS module text;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES profiles(user_id);
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS upload_date timestamptz NOT NULL DEFAULT now();
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS posted_by uuid REFERENCES profiles(user_id);
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE;
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS download_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(user_id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'download' CHECK (action IN ('view', 'download')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  payment_id text NOT NULL UNIQUE,
  amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmation text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  semester text,
  assessment_date date,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'open', 'closed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, enrollment_no, level, phone)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'Student'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'enrollment_no', ''),
    NULLIF(NEW.raw_user_meta_data->>'level', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin' AND is_disabled = false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (name, enrollment_no, level, phone) ON profiles TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_subjects" ON subjects;
DROP POLICY IF EXISTS "public_insert_subjects" ON subjects;
DROP POLICY IF EXISTS "public_update_subjects" ON subjects;
DROP POLICY IF EXISTS "public_delete_subjects" ON subjects;
DROP POLICY IF EXISTS "public_read_materials" ON study_materials;
DROP POLICY IF EXISTS "public_insert_materials" ON study_materials;
DROP POLICY IF EXISTS "public_update_materials" ON study_materials;
DROP POLICY IF EXISTS "public_delete_materials" ON study_materials;
DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
DROP POLICY IF EXISTS "public_insert_announcements" ON announcements;
DROP POLICY IF EXISTS "public_update_announcements" ON announcements;
DROP POLICY IF EXISTS "public_delete_announcements" ON announcements;
DROP POLICY IF EXISTS "public_read_feedback" ON feedback;
DROP POLICY IF EXISTS "public_insert_feedback" ON feedback;
DROP POLICY IF EXISTS "public_update_feedback" ON feedback;
DROP POLICY IF EXISTS "public_delete_feedback" ON feedback;
DROP POLICY IF EXISTS "public_read_contact_requests" ON contact_requests;
DROP POLICY IF EXISTS "public_insert_contact_requests" ON contact_requests;
DROP POLICY IF EXISTS "public_update_contact_requests" ON contact_requests;
DROP POLICY IF EXISTS "public_delete_contact_requests" ON contact_requests;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'student');
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK ((auth.uid() = user_id AND role = 'student') OR public.is_admin());
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "subjects_select_authenticated" ON subjects;
CREATE POLICY "subjects_select_authenticated" ON subjects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "subjects_insert_admin" ON subjects;
CREATE POLICY "subjects_insert_admin" ON subjects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "subjects_update_admin" ON subjects;
CREATE POLICY "subjects_update_admin" ON subjects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "subjects_delete_admin" ON subjects;
CREATE POLICY "subjects_delete_admin" ON subjects FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "materials_select_authenticated" ON study_materials;
CREATE POLICY "materials_select_authenticated" ON study_materials FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "materials_insert_admin" ON study_materials;
CREATE POLICY "materials_insert_admin" ON study_materials FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND uploaded_by = auth.uid());
DROP POLICY IF EXISTS "materials_update_admin" ON study_materials;
CREATE POLICY "materials_update_admin" ON study_materials FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "materials_delete_admin" ON study_materials;
CREATE POLICY "materials_delete_admin" ON study_materials FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "announcements_select_authenticated" ON announcements;
CREATE POLICY "announcements_select_authenticated" ON announcements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "announcements_insert_admin" ON announcements;
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND posted_by = auth.uid());
DROP POLICY IF EXISTS "announcements_update_admin" ON announcements;
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "announcements_delete_admin" ON announcements;
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "feedback_select_own_or_admin" ON feedback;
CREATE POLICY "feedback_select_own_or_admin" ON feedback FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "feedback_insert_own" ON feedback;
CREATE POLICY "feedback_insert_own" ON feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "feedback_update_admin" ON feedback;
CREATE POLICY "feedback_update_admin" ON feedback FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "feedback_delete_admin" ON feedback;
CREATE POLICY "feedback_delete_admin" ON feedback FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact_select_own_or_admin" ON contact_requests;
CREATE POLICY "contact_select_own_or_admin" ON contact_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "contact_insert_own" ON contact_requests;
CREATE POLICY "contact_insert_own" ON contact_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "contact_update_own_or_admin" ON contact_requests;
CREATE POLICY "contact_update_own_or_admin" ON contact_requests FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "contact_delete_admin" ON contact_requests;
CREATE POLICY "contact_delete_admin" ON contact_requests FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "downloads_select_own_or_admin" ON download_records;
CREATE POLICY "downloads_select_own_or_admin" ON download_records FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "downloads_insert_own" ON download_records;
CREATE POLICY "downloads_insert_own" ON download_records FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "downloads_update_admin" ON download_records;
CREATE POLICY "downloads_update_admin" ON download_records FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "downloads_delete_admin" ON download_records;
CREATE POLICY "downloads_delete_admin" ON download_records FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "payments_select_own_or_admin" ON payments;
CREATE POLICY "payments_select_own_or_admin" ON payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "payments_insert_admin" ON payments;
CREATE POLICY "payments_insert_admin" ON payments FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "payments_update_admin" ON payments;
CREATE POLICY "payments_update_admin" ON payments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "payments_delete_admin" ON payments;
CREATE POLICY "payments_delete_admin" ON payments FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "assessments_select_authenticated" ON assessments;
CREATE POLICY "assessments_select_authenticated" ON assessments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "assessments_insert_admin" ON assessments;
CREATE POLICY "assessments_insert_admin" ON assessments FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "assessments_update_admin" ON assessments;
CREATE POLICY "assessments_update_admin" ON assessments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "assessments_delete_admin" ON assessments;
CREATE POLICY "assessments_delete_admin" ON assessments FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('study-materials', 'study-materials', false, 10485760, ARRAY['application/pdf','image/png','image/jpeg','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

DROP POLICY IF EXISTS "study_materials_read_authenticated" ON storage.objects;
CREATE POLICY "study_materials_read_authenticated" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'study-materials');
DROP POLICY IF EXISTS "study_materials_insert_admin" ON storage.objects;
CREATE POLICY "study_materials_insert_admin" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'study-materials' AND public.is_admin());
DROP POLICY IF EXISTS "study_materials_update_admin" ON storage.objects;
CREATE POLICY "study_materials_update_admin" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'study-materials' AND public.is_admin()) WITH CHECK (bucket_id = 'study-materials' AND public.is_admin());
DROP POLICY IF EXISTS "study_materials_delete_admin" ON storage.objects;
CREATE POLICY "study_materials_delete_admin" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'study-materials' AND public.is_admin());