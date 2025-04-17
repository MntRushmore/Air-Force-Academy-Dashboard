-- Create timeline_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'completed', 'in_progress', 'upcoming', 'scheduled'
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT,
  color TEXT,
  position INTEGER NOT NULL,
  completed_date TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY timeline_events_service_role_policy ON timeline_events 
  USING (true)
  WITH CHECK (true);

-- Create index on client_id for faster queries
CREATE INDEX IF NOT EXISTS timeline_events_client_id_idx ON timeline_events(client_id);

-- Create index on position for faster ordering
CREATE INDEX IF NOT EXISTS timeline_events_position_idx ON timeline_events(position);
