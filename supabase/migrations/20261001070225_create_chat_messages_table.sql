/*
# Create chat_messages table for AI study assistant

1. New Tables
- `chat_messages`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, references auth.users, defaults to authenticated user)
  - `role` (text, not null: 'user' or 'assistant')
  - `content` (text, not null)
  - `created_at` (timestamptz, defaults to now)

2. Security
- Enable RLS on `chat_messages`.
- Owner-scoped CRUD: each authenticated user can only access their own chat messages.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the policy.
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat_messages" ON chat_messages;
CREATE POLICY "select_own_chat_messages"
  ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat_messages" ON chat_messages
;
CREATE POLICY "insert_own_chat_messages"
  ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat_messages" ON chat_messages;
CREATE POLICY "delete_own_chat_messages"
  ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
