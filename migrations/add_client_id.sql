-- Add client_id column to all tables
ALTER TABLE profiles ADD COLUMN client_id TEXT;
ALTER TABLE tasks ADD COLUMN client_id TEXT;
ALTER TABLE events ADD COLUMN client_id TEXT;
ALTER TABLE journal_entries ADD COLUMN client_id TEXT;
ALTER TABLE mentors ADD COLUMN client_id TEXT;
ALTER TABLE meeting_logs ADD COLUMN client_id TEXT;
ALTER TABLE questions ADD COLUMN client_id TEXT;
ALTER TABLE exercises ADD COLUMN client_id TEXT;
ALTER TABLE goals ADD COLUMN client_id TEXT;
ALTER TABLE courses ADD COLUMN client_id TEXT;
ALTER TABLE grades ADD COLUMN client_id TEXT;
ALTER TABLE settings ADD COLUMN client_id TEXT;

-- Create indexes for client_id
CREATE INDEX idx_profiles_client_id ON profiles(client_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_journal_entries_client_id ON journal_entries(client_id);
CREATE INDEX idx_mentors_client_id ON mentors(client_id);
CREATE INDEX idx_meeting_logs_client_id ON meeting_logs(client_id);
CREATE INDEX idx_questions_client_id ON questions(client_id);
CREATE INDEX idx_exercises_client_id ON exercises(client_id);
CREATE INDEX idx_goals_client_id ON goals(client_id);
CREATE INDEX idx_courses_client_id ON courses(client_id);
CREATE INDEX idx_grades_client_id ON grades(client_id);
CREATE INDEX idx_settings_client_id ON settings(client_id);

-- Modify RLS policies to use client_id instead of user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Clients can view their own profile" 
ON profiles FOR SELECT 
USING (client_id = current_setting('app.client_id', true));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Clients can update their own profile" 
ON profiles FOR UPDATE 
USING (client_id = current_setting('app.client_id', true));

-- Tasks table policy
DROP POLICY IF EXISTS "Users can CRUD their own tasks" ON tasks;
CREATE POLICY "Clients can CRUD their own tasks" 
ON tasks FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Events table policy
DROP POLICY IF EXISTS "Users can CRUD their own events" ON events;
CREATE POLICY "Clients can CRUD their own events" 
ON events FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Journal Entries table policy
DROP POLICY IF EXISTS "Users can CRUD their own journal entries" ON journal_entries;
CREATE POLICY "Clients can CRUD their own journal entries" 
ON journal_entries FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Mentors table policy
DROP POLICY IF EXISTS "Users can CRUD their own mentors" ON mentors;
CREATE POLICY "Clients can CRUD their own mentors" 
ON mentors FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Meeting Logs table policy
DROP POLICY IF EXISTS "Users can CRUD their own meeting logs" ON meeting_logs;
CREATE POLICY "Clients can CRUD their own meeting logs" 
ON meeting_logs FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Questions table policy
DROP POLICY IF EXISTS "Users can CRUD their own questions" ON questions;
CREATE POLICY "Clients can CRUD their own questions" 
ON questions FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Exercises table policy
DROP POLICY IF EXISTS "Users can CRUD their own exercises" ON exercises;
CREATE POLICY "Clients can CRUD their own exercises" 
ON exercises FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Goals table policy
DROP POLICY IF EXISTS "Users can CRUD their own goals" ON goals;
CREATE POLICY "Clients can CRUD their own goals" 
ON goals FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Courses table policy
DROP POLICY IF EXISTS "Users can CRUD their own courses" ON courses;
CREATE POLICY "Clients can CRUD their own courses" 
ON courses FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Grades table policy
DROP POLICY IF EXISTS "Users can CRUD their own grades" ON grades;
CREATE POLICY "Clients can CRUD their own grades" 
ON grades FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Settings table policy
DROP POLICY IF EXISTS "Users can CRUD their own settings" ON settings;
CREATE POLICY "Clients can CRUD their own settings" 
ON settings FOR ALL 
USING (client_id = current_setting('app.client_id', true));

-- Create function to set client_id from header
CREATE OR REPLACE FUNCTION set_client_id()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.client_id', current_setting('request.headers.x-client-id', true), true);
EXCEPTION
  WHEN OTHERS THEN
    -- Default to empty string if header not present
    PERFORM set_config('app.client_id', '', true);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run set_client_id before each query
CREATE OR REPLACE FUNCTION trigger_set_client_id()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM set_client_id();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
