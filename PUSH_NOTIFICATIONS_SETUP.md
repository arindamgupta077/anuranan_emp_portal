# Push Notification Setup Guide

This guide will help you set up push notifications for task reminders in the Anuranan Employee Portal.

## Features

✅ Push notifications for task due dates and execution dates
✅ Daily automated cron job to check and send reminders
✅ User-friendly notification permission banner
✅ Enable/disable notifications from user settings
✅ Works on mobile devices when app is installed as PWA
✅ Background notifications even when app is closed

## Setup Instructions

### 1. Install Required Dependencies

```powershell
npm install web-push
npm install --save-dev @types/web-push
```

### 2. Generate VAPID Keys

VAPID keys are required for web push notifications. Generate them using:

```powershell
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BKxxx...xxx
Private Key: xxx...xxx
```

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:your-email@example.com

# Cron Secret for securing cron endpoints
CRON_SECRET=your_random_secret_here

# Site URL (for cron jobs to call notification API)
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

**Generate a secure CRON_SECRET:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 4. Run Database Migration

Execute the SQL migration to create the `push_subscriptions` table:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase/push-subscriptions.sql`

Or use the Supabase CLI:
```powershell
supabase db push
```

### 5. Set Up Cron Job

#### For Netlify:

Create `netlify/functions/daily-notifications.ts`:

```typescript
import { schedule } from '@netlify/functions'

const handler = async () => {
  const response = await fetch(
    `${process.env.URL}/api/notifications/cron/daily`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    }
  )
  
  const data = await response.json()
  console.log('Notification cron result:', data)
  
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}

export const dailyNotifications = schedule('0 8 * * *', handler)
```

#### For Vercel:

Add to `vercel.json`:

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

The cron runs daily at 8:00 AM UTC. Adjust the schedule as needed.

**Cron Schedule Format:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Examples:
- `0 8 * * *` - Daily at 8 AM
- `0 9,17 * * 1-5` - Weekdays at 9 AM and 5 PM
- `0 */4 * * *` - Every 4 hours

### 6. Enable Actual Push Sending

Update `src/app/api/notifications/send/route.ts` to uncomment the web-push code:

```typescript
// Install web-push first: npm install web-push
const webpush = require('web-push')

webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const results = await Promise.allSettled(
  subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key,
      },
    }
    
    return webpush.sendNotification(
      pushSubscription,
      JSON.stringify(notification)
    )
  })
)

// Clean up failed subscriptions
const failedIndices = results
  .map((result, index) => result.status === 'rejected' ? index : -1)
  .filter(index => index !== -1)

for (const index of failedIndices) {
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('id', subscriptions[index].id)
}
```

### 7. Deploy and Test

1. **Deploy your changes:**
   ```powershell
   git add .
   git commit -m "Add push notification support"
   git push
   ```

2. **Test the notification flow:**
   - Visit your deployed app
   - You should see a blue banner asking to enable notifications
   - Click "Enable" and grant permission
   - Create a task with today's due date or execution date
   - Wait for the cron job to run (or trigger it manually)

3. **Manual cron test:**
   ```powershell
   curl -X GET "https://your-site.netlify.app/api/notifications/cron/daily" `
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

## How It Works

### User Flow

1. User visits the app on their mobile device
2. A banner appears asking to enable notifications
3. User clicks "Enable" and grants browser permission
4. App subscribes to push notifications using VAPID keys
5. Subscription is stored in the database

### Daily Reminder Flow

1. Cron job runs daily at 8 AM (configurable)
2. System queries for tasks with `due_date` or `execution_date` matching today
3. Tasks are grouped by assigned user
4. For each user with tasks:
   - Generate notification message
   - Send push notification to all their subscribed devices
5. Failed subscriptions are cleaned up automatically

### Notification Display

- Appears as native device notification
- Shows task title and reminder type
- Clicking opens the app to the tasks page
- Works even when app is closed

## Browser Support

- ✅ Chrome (Android, Desktop)
- ✅ Firefox (Android, Desktop)  
- ✅ Edge (Desktop)
- ✅ Safari (iOS 16.4+, macOS)
- ✅ Samsung Internet
- ❌ iOS Safari (before 16.4)

## Troubleshooting

### Notifications not appearing

1. **Check browser support:**
   ```javascript
   console.log('Push supported:', 'PushManager' in window)
   console.log('Notification supported:', 'Notification' in window)
   ```

2. **Check permission:**
   ```javascript
   console.log('Permission:', Notification.permission)
   ```

3. **Verify VAPID keys:**
   - Make sure they're correctly set in environment variables
   - Public key should be in `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - Private key should be in `VAPID_PRIVATE_KEY` (not public)

4. **Check service worker:**
   - Open DevTools → Application → Service Workers
   - Verify service worker is active
   - Check for errors in console

5. **Test subscription:**
   - Open DevTools → Application → Push Messaging
   - Check if subscription exists

### Cron job not running

1. **Verify cron configuration:**
   - Netlify: Check Functions tab in dashboard
   - Vercel: Check Cron Jobs tab in project settings

2. **Check CRON_SECRET:**
   - Must match in both `.env.local` and deployment environment

3. **Test manually:**
   ```powershell
   curl -X GET "https://your-site.com/api/notifications/cron/daily" `
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Database errors

1. **Verify table exists:**
   ```sql
   SELECT * FROM push_subscriptions LIMIT 1;
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'push_subscriptions';
   ```

## Security Considerations

1. **VAPID keys:** Keep private key secret, only public key in client
2. **CRON_SECRET:** Use strong random string, store securely
3. **RLS policies:** Users can only manage their own subscriptions
4. **HTTPS required:** Push notifications only work over HTTPS
5. **Validate cron requests:** Always check Authorization header

## Customization

### Change notification time

Edit the cron schedule in `vercel.json` or Netlify function:
```typescript
// Daily at 9 AM
schedule('0 9 * * *', handler)

// Twice daily at 9 AM and 5 PM
schedule('0 9,17 * * *', handler)
```

### Customize notification message

Edit `src/app/api/notifications/cron/daily/route.ts`:
```typescript
const notificationTitle = `Your Custom Title`
const notificationBody = `Your custom message`
```

### Add more notification triggers

Create additional cron jobs:
- Weekly summary: `0 9 * * 1` (Mondays at 9 AM)
- End of day: `0 18 * * *` (Daily at 6 PM)
- Upcoming tasks: `0 9 * * *` (3 days before due)

## Testing Checklist

- [ ] Database migration successful
- [ ] VAPID keys generated and configured
- [ ] Environment variables set
- [ ] Notification banner appears
- [ ] Can grant permission
- [ ] Subscription stored in database
- [ ] Cron job configured
- [ ] Manual cron trigger works
- [ ] Notifications display correctly
- [ ] Clicking notification opens app
- [ ] Can disable notifications
- [ ] Works on mobile device
- [ ] Works as installed PWA

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test with browser DevTools
4. Check Supabase logs
5. Review cron job execution logs

## Next Steps

1. Install dependencies: `npm install web-push`
2. Generate VAPID keys
3. Configure environment variables
4. Run database migration
5. Set up cron job
6. Deploy and test

Happy coding! 🚀
