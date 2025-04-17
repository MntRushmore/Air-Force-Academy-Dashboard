-- Add client_id column to all tables that previously relied on user_id
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE meeting_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS client_id TEXT;

-- Update RLS policies to use client_id instead of user_id
-- This is a simplified example - you would need to update all policies
CREATE OR REPLACE POLICY "Public access based on client_id" 
ON profiles FOR ALL 
USING (client_id IS NOT NULL);

CREATE OR REPLACE POLICY "Public access based on client_id" 
ON tasks FOR ALL 
USING (client_id IS NOT NULL);

-- Repeat for other tables
