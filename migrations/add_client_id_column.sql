-- Add client_id column to all tables
ALTER TABLE courses ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE meeting_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS client_id TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_courses_client_id ON courses(client_id);
CREATE INDEX IF NOT EXISTS idx_grades_client_id ON grades(client_id);
CREATE INDEX IF NOT EXISTS idx_settings_client_id ON settings(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_client_id ON journal_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_mentors_client_id ON mentors(client_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_client_id ON meeting_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_questions_client_id ON questions(client_id);
CREATE INDEX IF NOT EXISTS idx_exercises_client_id ON exercises(client_id);
CREATE INDEX IF NOT EXISTS idx_goals_client_id ON goals(client_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_grades_course_client ON grades(course_id, client_id);
CREATE INDEX IF NOT EXISTS idx_settings_key_client ON settings(key, client_id);
