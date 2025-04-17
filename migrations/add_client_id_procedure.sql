-- Create a function to add client_id columns to all tables
CREATE OR REPLACE FUNCTION add_client_id_columns()
RETURNS void AS $$
BEGIN
    -- Check and add client_id to courses table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_courses_client_id ON courses(client_id);
    END IF;

    -- Check and add client_id to grades table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'grades' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE grades ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_grades_client_id ON grades(client_id);
    END IF;

    -- Check and add client_id to settings table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE settings ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_settings_client_id ON settings(client_id);
    END IF;

    -- Check and add client_id to tasks table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE tasks ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
    END IF;

    -- Check and add client_id to events table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE events ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
    END IF;

    -- Check and add client_id to journal_entries table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_journal_entries_client_id ON journal_entries(client_id);
    END IF;

    -- Check and add client_id to exercises table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE exercises ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_exercises_client_id ON exercises(client_id);
    END IF;

    -- Check and add client_id to goals table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'goals' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE goals ADD COLUMN client_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_goals_client_id ON goals(client_id);
    END IF;
END;
$$ LANGUAGE plpgsql;
