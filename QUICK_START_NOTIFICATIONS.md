# Quick Setup Guide - Push Notifications

You've already generated your VAPID keys! Here's what you need to do:

## ✅ Step 1: Install Dependencies

```powershell
npm install web-push
```

## ✅ Step 2: Configure Environment Variables

I've created `.env.local` with your VAPID keys. **Update these values:**

1. Add your Supabase credentials (if not already set)
2. Update `NEXT_PUBLIC_SITE_URL` with your deployment URL when you deploy

**For deployment (Netlify/Vercel), add these environment variables:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: BK29oDR5znF7LwjZ3FkkLh1gCzciBX8lJdpED6v76KiGbHm-9wMIm7inVceM3FyQQTuWEjO5ABmrT0nXFqbn38I
- `VAPID_PRIVATE_KEY`: nA0tSRAOkqv7ycs-3wRtEBnSx6Oj39uq1sAPGxMJcQY
- `VAPID_EMAIL`: mailto:arindamgupta077@gmail.com
- `CRON_SECRET`: lihjdcJaeO4RVLqAf1WFxEtp7T8oQUKb
- `NEXT_PUBLIC_SITE_URL`: https://your-site.netlify.app

## ✅ Step 3: Run Database Migration

Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Copy the contents of supabase/push-subscriptions.sql
```

Or just execute this file in your Supabase SQL Editor.

## ✅ Step 4: Enable Push Notifications in Code

Update `src/app/api/notifications/send/route.ts` - uncomment the web-push code (around line 50).

The code is already there as comments - just uncomment it!

## ✅ Step 5: Set Up Cron Job (After Deployment)

### For Netlify:

The Netlify scheduled function is already created in `netlify/functions/daily-notifications.js`!

After you push to GitHub and Netlify deploys:
1. Go to your Netlify site dashboard
2. You'll now see "Functions" in the sidebar
3. Click Functions → Scheduled Functions
4. You should see `daily-notifications` running daily at 8 AM UTC
5. Make sure all environment variables are set (see Step 2)

**The function will auto-deploy with your site!**

### For Vercel:
Create `vercel.json` in root:

```json
{
  "crons": [
    {
      "path": "/api/notifications/cron/daily",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## ✅ Step 6: Test Locally

```powershell
# Install dependencies
npm install web-push

# Run dev server
npm run dev

# Visit http://localhost:3000
# You should see the notification permission banner
```

## Quick Test After Setup

1. Enable notifications in the app (blue banner)
2. Create a task with today's date as due_date or execution_date
3. Manually trigger the cron:

```powershell
curl -X GET "http://localhost:3000/api/notifications/cron/daily" `
  -H "Authorization: Bearer lihjdcJaeO4RVLqAf1WFxEtp7T8oQUKb"
```

## That's It! 🎉

The system is now ready. You just need to:
1. Install `npm install web-push`
2. Run the SQL migration in Supabase
3. Uncomment the web-push code in `send/route.ts`
4. Deploy!

For full details, see `PUSH_NOTIFICATIONS_SETUP.md`
