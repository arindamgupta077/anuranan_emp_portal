# Supabase Database Setup Guide

This folder contains SQL scripts to set up your Supabase database for the Anuranan Employee Portal.

## Scripts Overview

1. **schema.sql** - Main database schema with all tables, indexes, RLS policies, functions, and triggers
2. **recurring-tasks-cron.sql** - Function to spawn recurring tasks (needs to be called daily)

## Setup Instructions

### Step 1: Run the Main Schema Script

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

This will create:
- All tables (users, tasks, self_tasks, leaves, recurring_tasks, roles, task_history)
- Indexes for performance optimization
- Default roles (CEO, Manager, Teacher, Operation Manager, Editor)
- Functions for role checks and utilities
- Triggers for automatic timestamp updates and task history
- Row Level Security (RLS) policies for data access control
- User creation handler

### Step 2: Set Up Recurring Tasks Spawning

1. In the Supabase SQL Editor, create a new query
2. Copy the entire contents of `recurring-tasks-cron.sql`
3. Paste and run it

This creates the `spawn_recurring_tasks()` function. You need to call it daily using one of these methods:

#### Option A: Netlify Scheduled Functions (Recommended for Netlify deployment)
- Create a scheduled function in your Next.js app (we'll set this up in the codebase)
- Netlify will call it automatically

#### Option B: Supabase pg_cron (if available in your plan)
```sql
SELECT cron.schedule(
    'spawn-recurring-tasks',
    '0 0 * * *',
    $$SELECT spawn_recurring_tasks()$$
);
```

#### Option C: External Cron Service
- Use cron-job.org or similar
- Call your Next.js API endpoint daily
- Endpoint: `https://your-app.netlify.app/api/cron/spawn-tasks`

### Step 3: Create Your First CEO User

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter email and password for the CEO account
4. Click **Create user**

5. Now go to **Table Editor** > **users** table
6. Find the newly created user
7. Click to edit the row
8. Set `role_id` to the UUID of the 'CEO' role:
   - You can find the CEO role UUID in the **roles** table
   - Or run this query to get it:
   ```sql
   SELECT id FROM public.roles WHERE name = 'CEO';
   ```
9. Ensure `is_active` is set to `true`
10. Save the changes

### Step 4: Configure Environment Variables

In your Next.js project root, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from:
- Supabase Dashboard > **Settings** > **API**
- Copy **Project URL** and **anon public** key

## Database Structure

### Tables

- **roles**: Employee roles (CEO, Manager, Teacher, etc.)
- **users**: Employee profiles linked to Supabase auth
- **tasks**: Assigned tasks with status tracking
- **task_history**: Audit log of task status changes
- **self_tasks**: Employee self-logged daily tasks
- **leaves**: Leave requests with approval workflow
- **recurring_tasks**: Rules for recurring task generation

### Key Features

- **Row Level Security (RLS)**: Users only see their own data; CEO sees everything
- **Automatic Timestamps**: `created_at` and `updated_at` managed by triggers
- **Task History**: Every status change is logged automatically
- **Role-Based Access**: Functions like `is_ceo()` enforce permissions
- **Data Integrity**: Foreign keys and constraints maintain consistency

## Testing the Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if roles are inserted
SELECT * FROM public.roles;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test the CEO check function
SELECT is_ceo('your-ceo-user-id-here');
```

## Troubleshooting

### Issue: RLS policies preventing access
- Ensure your user has a role assigned in the `users` table
- Check if the user's `is_active` is `true`
- Verify the user ID matches between `auth.users` and `public.users`

### Issue: Functions not working
- Make sure to run the entire schema.sql script
- Check function grants at the end of the script
- Verify `uuid-ossp` extension is enabled

### Issue: Recurring tasks not spawning
- Manually test: `SELECT spawn_recurring_tasks();`
- Check if recurring rules have `is_active = true`
- Verify `start_date` is not in the future
- Ensure assigned user exists and is active

## Need Help?

Refer to the main README.md in the project root for complete setup instructions and deployment guide.
