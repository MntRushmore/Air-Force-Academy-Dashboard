-- Check current RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'courses';

-- Disable RLS temporarily for troubleshooting (only if needed)
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Enable all access for authenticated users" 
ON courses
USING (true)
WITH CHECK (true);

-- Enable RLS again
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Allow public access (for development purposes)
ALTER TABLE courses FORCE ROW LEVEL SECURITY;
