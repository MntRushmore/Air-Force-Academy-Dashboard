-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pomodoro_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  duration INTEGER NOT NULL, -- Duration in seconds
  task TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own sessions
CREATE POLICY "Authenticated users can insert their own sessions" ON pomodoro_sessions 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create policy to allow authenticated users to select their own sessions
CREATE POLICY "Authenticated users can select their own sessions" ON pomodoro_sessions 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Create policy to allow authenticated users to update their own sessions
CREATE POLICY "Authenticated users can update their own sessions" ON pomodoro_sessions 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create policy to allow authenticated users to delete their own sessions
CREATE POLICY "Authenticated users can delete their own sessions" ON pomodoro_sessions 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS pomodoro_sessions_user_id_idx ON pomodoro_sessions(user_id);
