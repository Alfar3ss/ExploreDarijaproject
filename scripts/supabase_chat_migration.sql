-- Add preferred_language to users (public.users) and chat messages table
-- Run this on your Supabase database (psql or via Supabase SQL editor)

-- Add preferred_language column to users table (if not exists)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS preferred_language varchar(5);

-- Create conversations table (optional metadata)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'user' or 'assistant'
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
