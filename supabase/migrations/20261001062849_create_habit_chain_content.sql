/*
# Create Habit Chain study platform content

1. New Tables
- `subjects`: browseable academic subjects with semester and module metadata.
- `study_materials`: notes and question papers students can search and download.
- `announcements`: admin-posted updates shown on the student dashboard.
- `feedback`: student ratings and messages for the feedback system.
- `contact_requests`: student questions and support requests managed by admins.

2. Security
- Row Level Security is enabled on every table.
- This first version is a shared, no-login study hub, so anon and authenticated visitors can read and create content required by the visible flows.

3. Seed Content
- Adds representative modules, notes, question papers, and announcements so the dashboard is useful on first load.
*/

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  semester text NOT NULL,
  module text NOT NULL,
  accent text NOT NULL DEFAULT 'blue',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('note', 'question_paper', 'guide')),
  file_url text,
  pages integer NOT NULL DEFAULT 1,
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important'))
);

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  response text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_subjects" ON subjects;
CREATE POLICY "public_read_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_subjects" ON subjects;
CREATE POLICY "public_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_subjects" ON subjects;
CREATE POLICY "public_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_subjects" ON subjects;
CREATE POLICY "public_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_materials" ON study_materials;
CREATE POLICY "public_read_materials" ON study_materials FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_materials" ON study_materials;
CREATE POLICY "public_insert_materials" ON study_materials FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_materials" ON study_materials;
CREATE POLICY "public_update_materials" ON study_materials FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_materials" ON study_materials;
CREATE POLICY "public_delete_materials" ON study_materials FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_announcements" ON announcements;
CREATE POLICY "public_read_announcements" ON announcements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_announcements" ON announcements;
CREATE POLICY "public_insert_announcements" ON announcements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_announcements" ON announcements;
CREATE POLICY "public_update_announcements" ON announcements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_announcements" ON announcements;
CREATE POLICY "public_delete_announcements" ON announcements FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_feedback" ON feedback;
CREATE POLICY "public_read_feedback" ON feedback FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_feedback" ON feedback;
CREATE POLICY "public_insert_feedback" ON feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_feedback" ON feedback;
CREATE POLICY "public_update_feedback" ON feedback FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_feedback" ON feedback;
CREATE POLICY "public_delete_feedback" ON feedback FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_contact_requests" ON contact_requests;
CREATE POLICY "public_read_contact_requests" ON contact_requests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_contact_requests" ON contact_requests;
CREATE POLICY "public_insert_contact_requests" ON contact_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_contact_requests" ON contact_requests;
CREATE POLICY "public_update_contact_requests" ON contact_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_contact_requests" ON contact_requests;
CREATE POLICY "public_delete_contact_requests" ON contact_requests FOR DELETE TO anon, authenticated USING (true);

INSERT INTO subjects (name, code, semester, module, accent) VALUES
  ('Data Structures', 'CS201', 'Semester 2', 'Core module', 'blue'),
  ('Database Systems', 'CS204', 'Semester 2', 'Core module', 'mint'),
  ('Web Development', 'CS208', 'Semester 2', 'Practical module', 'coral'),
  ('Computer Networks', 'CS210', 'Semester 2', 'Core module', 'amber')
ON CONFLICT (code) DO NOTHING;

INSERT INTO study_materials (subject_id, title, description, type, pages, downloads)
SELECT id, 'Stacks & Queues — quick notes', 'A clear visual guide to linear data structures, operations, and common exam patterns.', 'note', 12, 128 FROM subjects WHERE code = 'CS201'
ON CONFLICT DO NOTHING;
INSERT INTO study_materials (subject_id, title, description, type, pages, downloads)
SELECT id, 'Database Systems — May 2025', 'Past paper with short questions, relational algebra, and SQL practice.', 'question_paper', 8, 92 FROM subjects WHERE code = 'CS204'
ON CONFLICT DO NOTHING;
INSERT INTO study_materials (subject_id, title, description, type, pages, downloads)
SELECT id, 'Responsive UI checklist', 'A practical one-page revision guide for accessible, responsive web interfaces.', 'guide', 3, 76 FROM subjects WHERE code = 'CS208'
ON CONFLICT DO NOTHING;
INSERT INTO study_materials (subject_id, title, description, type, pages, downloads)
SELECT id, 'Computer Networks — November 2024', 'Past assessment covering TCP/IP, routing, and network security fundamentals.', 'question_paper', 10, 64 FROM subjects WHERE code = 'CS210'
ON CONFLICT DO NOTHING;

INSERT INTO announcements (title, description, priority) VALUES
  ('New question papers are here', 'The latest May 2025 papers are now available for Database Systems and Web Development.', 'important'),
  ('Welcome to Habit Chain', 'Find your next resource, keep your streak alive, and learn at your own pace.', 'normal')
ON CONFLICT DO NOTHING;