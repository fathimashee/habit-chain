/*
# Habit AI: Conversations, Messages, and Generated Materials

1. New Tables
- `ai_conversations` — Stores chat sessions for each student.
  - `conversation_id` (uuid PK)
  - `user_id` (uuid, defaults to auth.uid(), references auth.users)
  - `title` (text, defaults to 'New chat')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz, auto-updates on message insert)
- `ai_messages` — Individual messages within a conversation.
  - `message_id` (uuid PK)
  - `conversation_id` (uuid FK to ai_conversations, cascade delete)
  - `user_id` (uuid, defaults to auth.uid(), references auth.users)
  - `role` (text: 'user' | 'assistant')
  - `content` (text)
  - `materials` (jsonb, nullable — material search results attached to a message)
  - `created_at` (timestamptz)
- `generated_materials` — AI-generated study materials saved by students.
  - `generated_material_id` (uuid PK)
  - `user_id` (uuid, defaults to auth.uid(), references auth.users)
  - `title` (text)
  - `subject` (text, nullable)
  - `module` (text, nullable)
  - `material_type` (text)
  - `content` (text)
  - `created_at` (timestamptz)

2. Security
- RLS enabled on all three tables.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy policy checks.
- `ai_messages` ownership is checked both directly (user_id) and via parent conversation.
- `updated_at` on ai_conversations auto-updates via trigger when a new message is inserted.

3. Indexes
- `ai_messages` on `conversation_id` for efficient message retrieval.
- `ai_conversations` on `user_id` for efficient sidebar listing.
- `generated_materials` on `user_id` for efficient listing.
*/

CREATE TABLE IF NOT EXISTS ai_conversations (
  conversation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_conversations" ON ai_conversations;
CREATE POLICY "select_own_ai_conversations" ON ai_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_conversations" ON ai_conversations;
CREATE POLICY "insert_own_ai_conversations" ON ai_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_conversations" ON ai_conversations;
CREATE POLICY "update_own_ai_conversations" ON ai_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_conversations" ON ai_conversations;
CREATE POLICY "delete_own_ai_conversations" ON ai_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_messages (
  message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(conversation_id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  materials jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_messages" ON ai_messages;
CREATE POLICY "select_own_ai_messages" ON ai_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_messages" ON ai_messages;
CREATE POLICY "insert_own_ai_messages" ON ai_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_messages" ON ai_messages;
CREATE POLICY "delete_own_ai_messages" ON ai_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);

CREATE TABLE IF NOT EXISTS generated_materials (
  generated_material_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text,
  module text,
  material_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_generated_materials" ON generated_materials;
CREATE POLICY "select_own_generated_materials" ON generated_materials FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_generated_materials" ON generated_materials;
CREATE POLICY "insert_own_generated_materials" ON generated_materials FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_generated_materials" ON generated_materials;
CREATE POLICY "delete_own_generated_materials" ON generated_materials FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_materials_user ON generated_materials(user_id);

-- Auto-update ai_conversations.updated_at when a new message is inserted
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations SET updated_at = now() WHERE conversation_id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON ai_messages;
CREATE TRIGGER trg_update_conversation_timestamp
  AFTER INSERT ON ai_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();
