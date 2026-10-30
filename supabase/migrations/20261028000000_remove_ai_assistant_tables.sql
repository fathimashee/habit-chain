/*
# Remove AI Assistant Tables and Functions

1. Changes
- Safely drop AI assistant tables that are no longer used by the application:
  - `generated_materials`
  - `ai_messages`
  - `ai_conversations`
  - `chat_messages`
- Safely drop AI trigger functions:
  - `update_conversation_timestamp()`

2. Security & Data Integrity
- Does NOT alter or delete any student study materials, subjects, announcements, feedback, contact requests, profiles, or download history.
- Ensures no orphaned AI dependencies remain in the database schema.
*/

DROP TABLE IF EXISTS public.generated_materials CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;

DROP FUNCTION IF EXISTS public.update_conversation_timestamp() CASCADE;
