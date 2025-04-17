# Database Seeding Scripts

This directory contains scripts to seed your Supabase database with sample data for testing.

## Prerequisites

Before running the seed script, make sure you have:

1. Set up your Supabase project and created the database schema
2. Added the following environment variables to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (not the anon key)

> **IMPORTANT**: The service role key has admin privileges. Never expose it in your frontend code or commit it to version control.

## Running the Seed Script

To populate your database with sample data:

\`\`\`bash
npm run seed-db
\`\`\`

or

\`\`\`bash
npx tsx scripts/run-seed.ts
\`\`\`

## What Gets Created

The seed script will:

1. Create a test user with email `test@usafaapp.com` and password `testpassword123`
2. Populate all tables with sample data related to the USAFA application process
3. Create relationships between the data (e.g., grades linked to courses)

## Sample Data

The seed script creates realistic sample data for:

- User profile
- Fitness exercises and goals
- Academic courses and grades
- Tasks and events
- Journal entries
- Mentors and meeting logs
- Application-related questions
- User settings

## After Seeding

After running the seed script, you can:

1. Log in with the test user credentials
2. Explore all features of the application with pre-populated data
3. Test data synchronization and updates
\`\`\`

Finally, let's update the package.json to add a script for running the seed:
