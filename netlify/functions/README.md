# Netlify Functions

This folder contains Netlify serverless functions and scheduled functions for the Anuranan Employee Portal.

## Scheduled Functions

### `daily-notifications.js`

**Purpose:** Sends push notifications to users for tasks due or scheduled for execution today.

**Schedule:** Daily at 8:00 AM UTC

**How it works:**
1. Netlify triggers this function based on the cron schedule
2. Function calls `/api/notifications/cron/daily` endpoint
3. Endpoint queries tasks with today's due_date or execution_date
4. Push notifications are sent to all assigned users

**Configuration:**

Make sure these environment variables are set in Netlify:
- `CRON_SECRET` - Secret key for securing cron endpoints
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - VAPID public key for push notifications
- `VAPID_PRIVATE_KEY` - VAPID private key (keep secure)
- `VAPID_EMAIL` - Contact email for VAPID
- `NEXT_PUBLIC_SITE_URL` - Your site URL (auto-set by Netlify as `URL`)

**Testing:**

You can manually trigger the function from:
1. Netlify Dashboard → Functions → Scheduled Functions → daily-notifications
2. Click "Execute function now"

Or test locally:
```bash
netlify dev
netlify functions:invoke daily-notifications
```

**Changing the Schedule:**

Edit the cron expression in `daily-notifications.js`:

```javascript
// Examples:
export const dailyNotifications = schedule('0 9 * * *', handler)      // 9 AM daily
export const dailyNotifications = schedule('0 8,17 * * *', handler)   // 8 AM and 5 PM
export const dailyNotifications = schedule('0 8 * * 1-5', handler)    // Weekdays at 8 AM
```

## Deployment

These functions are automatically deployed when you push to your repository. Netlify will:
1. Detect the functions in `netlify/functions/`
2. Build and deploy them
3. Enable the "Functions" menu in your dashboard
4. Set up the scheduled triggers automatically

## Monitoring

View function logs in:
- Netlify Dashboard → Functions → [function-name] → Logs
- Or use Netlify CLI: `netlify functions:list` and `netlify logs:function daily-notifications`
