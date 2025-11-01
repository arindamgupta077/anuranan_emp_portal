# Cron Job Setup for Recurring Tasks

This document explains how to set up automated spawning of recurring tasks.

## Overview

The application has a built-in system to automatically create tasks based on recurring task rules (weekly or monthly). This is handled by:

1. **Database Function**: `spawn_recurring_tasks()` in `supabase/recurring-tasks-cron.sql`
2. **API Endpoint**: `/api/cron/spawn-tasks` that calls the database function
3. **Cron Service**: External service (Netlify, Vercel, or cron-job.org) that triggers the API endpoint daily

## Setup Instructions

### Step 1: Environment Variables

Add these variables to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CRON_SECRET=your_random_secret_string
```

**Getting the Service Role Key:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the `service_role` key (keep this secret!)

**Creating a Cron Secret:**
```bash
# Generate a random secret (use this output as CRON_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Deploy the Application

Deploy your application to Netlify or Vercel. The cron endpoint will be available at:

```
https://your-app.netlify.app/api/cron/spawn-tasks
```

### Step 3: Set Up the Cron Job

You have several options:

#### Option A: Netlify Scheduled Functions (Recommended for Netlify)

Create `netlify/functions/scheduled-cron.ts`:

```typescript
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const response = await fetch(`${process.env.URL}/api/cron/spawn-tasks`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};

export { handler };
```

Then add to `netlify.toml`:

```toml
[[functions]]
  path = "/scheduled-cron"
  schedule = "0 1 * * *"  # Runs at 1 AM daily
```

#### Option B: Vercel Cron Jobs (For Vercel deployments)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/spawn-tasks",
      "schedule": "0 1 * * *"
    }
  ]
}
```

Note: Vercel cron requires authorization header in the route handler.

#### Option C: External Cron Service (cron-job.org)

1. Go to [cron-job.org](https://cron-job.org/)
2. Create a free account
3. Create a new cron job:
   - **URL**: `https://your-app.netlify.app/api/cron/spawn-tasks`
   - **Schedule**: Daily at 1:00 AM (or your preferred time)
   - **Request method**: GET
   - **Request headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
4. Save and activate

#### Option D: GitHub Actions (Free for public repos)

Create `.github/workflows/cron.yml`:

```yaml
name: Daily Cron Job
on:
  schedule:
    - cron: '0 1 * * *'  # Runs at 1 AM UTC daily
  workflow_dispatch:  # Allows manual triggering

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger spawn-tasks endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.netlify.app/api/cron/spawn-tasks
```

Then add `CRON_SECRET` to your GitHub repository secrets.

## How It Works

### Daily Process

1. **Cron triggers** the API endpoint at scheduled time (e.g., 1 AM)
2. **API endpoint** verifies the authorization header matches `CRON_SECRET`
3. **Database function** `spawn_recurring_tasks()` is called, which:
   - Finds all active recurring task rules
   - Checks if today matches the rule (day of week or day of month)
   - Verifies the rule is within its date range (start_date to end_date)
   - Creates a new task if one doesn't already exist for today
4. **Response** returns success/failure status

### Example Recurring Task Rules

**Weekly Task** (Every Monday):
- Frequency: WEEKLY
- Day of Week: 1 (Monday)
- Start Date: 2024-01-01
- End Date: null (runs indefinitely)

**Monthly Task** (15th of each month):
- Frequency: MONTHLY
- Day of Month: 15
- Start Date: 2024-01-01
- End Date: 2024-12-31

## Testing

### Manual Testing

You can manually trigger the cron job to test:

```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.netlify.app/api/cron/spawn-tasks
```

Expected response:
```json
{
  "success": true,
  "message": "Recurring tasks spawned successfully",
  "result": null
}
```

### Database Testing

You can also test the database function directly in Supabase SQL Editor:

```sql
SELECT spawn_recurring_tasks();
```

This will show you how many tasks were created.

## Monitoring

### Check Logs

**Netlify:**
- Go to your site → Functions → scheduled-cron → Logs

**Vercel:**
- Go to your project → Deployments → Cron Logs

**cron-job.org:**
- Dashboard → Your Job → Execution History

### Verify Tasks Created

Check in your Supabase database:

```sql
-- See recently created tasks from recurring rules
SELECT 
  t.*,
  u.full_name as assigned_to_name,
  rt.title as recurring_task_title
FROM tasks t
JOIN users u ON u.id = t.assigned_to
LEFT JOIN recurring_tasks rt ON rt.title = t.title
WHERE t.created_at > NOW() - INTERVAL '1 day'
ORDER BY t.created_at DESC;
```

## Troubleshooting

### Cron not running

1. **Check authorization**: Make sure `CRON_SECRET` matches in both `.env.local` and cron service
2. **Check URL**: Verify the endpoint URL is correct (https, no trailing slash)
3. **Check logs**: Look at function logs for errors
4. **Test manually**: Use curl to verify endpoint works

### Tasks not being created

1. **Check recurring rules**: Verify rules are marked `is_active = true`
2. **Check dates**: Ensure today's date is within start_date and end_date
3. **Check day matching**: Verify day_of_week or day_of_month matches today
4. **Run SQL function**: Test `SELECT spawn_recurring_tasks()` directly

### Multiple tasks created

The database function has a check to prevent duplicate tasks on the same day. If you're seeing duplicates:

1. Check if cron is triggering multiple times
2. Verify the unique constraint in the tasks table
3. Check function logic in `recurring-tasks-cron.sql`

## Best Practices

1. **Run at off-peak hours**: 1-3 AM in your timezone
2. **Monitor regularly**: Check logs weekly to ensure it's working
3. **Set end dates**: For temporary recurring tasks, always set an end_date
4. **Test before deploying**: Manually test the endpoint before setting up cron
5. **Keep CRON_SECRET secure**: Never commit it to git, use environment variables

## Alternative: Supabase Cron (Future)

Supabase is working on native cron job support using pg_cron. When available, you can set this up directly in your database:

```sql
-- Not available yet, but coming soon
SELECT cron.schedule(
  'spawn-daily-tasks',
  '0 1 * * *',
  $$SELECT spawn_recurring_tasks()$$
);
```

This would eliminate the need for external cron services.

## Support

If you encounter issues:

1. Check the logs in your deployment platform
2. Test the endpoint manually with curl
3. Verify environment variables are set correctly
4. Check Supabase function logs in SQL Editor
5. Review the `recurring-tasks-cron.sql` function logic
