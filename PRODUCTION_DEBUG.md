# Production Notification Debugging Guide

## Issue: Notifications stuck on "Processing..." on Netlify

The notifications work on localhost but fail on production. Here's how to debug:

## Step 1: Check Browser Console on Production

1. Go to `https://anuranan-emp-portal.netlify.app`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try enabling notifications
5. Look for these specific errors:

### Common Errors:

#### Error 1: "VAPID public key not configured"
```
VAPID_PUBLIC_KEY is not set
```
**Solution:** VAPID keys missing from Netlify environment variables

#### Error 2: "Failed to subscribe to push notifications"
```
DOMException: Registration failed - no active service worker
```
**Solution:** Service worker not deployed or not loading

#### Error 3: "Service Worker registration failed"
```
Service Worker registration failed: SecurityError
```
**Solution:** HTTPS issue or CORS problem

#### Error 4: "401 Unauthorized"
```
Server response status: 401
```
**Solution:** Not logged in - this is OK, should show success message anyway

## Step 2: Check Service Worker

1. **F12** → **Application** tab
2. Click **Service Workers**
3. Verify:
   - [ ] `/sw.js` is listed
   - [ ] Status is "activated"
   - [ ] Scope is correct

### If Service Worker Missing:

**Check Network Tab:**
1. F12 → Network tab
2. Reload page
3. Search for `sw.js`
4. Check if it loads (status 200)

**If 404 error:**
- Service worker not deployed to Netlify
- Check `public/sw.js` exists in repo
- Verify it's in the `.next` build output

## Step 3: Check Environment Variables in Netlify

1. Go to Netlify Dashboard
2. Your site → **Site settings** → **Environment variables**
3. Verify these are set:

**Required Variables:**
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY = BK29oDR5znF7LwjZ3FkkLh1gCzciBX8lJdpED6v76KiGbHm-9wMIm7inVceM3FyQQTuWEjO5ABmrT0nXFqbn38I
VAPID_PRIVATE_KEY = nA0tSRAOkqv7ycs-3wRtEBnSx6Oj39uq1sAPGxMJcQY
VAPID_EMAIL = mailto:arindamgupta077@gmail.com
CRON_SECRET = lihjdcJaeO4RVLqAf1WFxEtp7T8oQUKb
NEXT_PUBLIC_SITE_URL = https://anuranan-emp-portal.netlify.app
```

**⚠️ Important:** After adding/changing variables:
- Click **"Save"**
- Go to **Deploys** → Click **"Trigger deploy"** → **"Clear cache and deploy"**

## Step 4: Check Build Logs

1. Netlify Dashboard → **Deploys** → Latest deploy
2. Look for errors related to:
   - Service worker
   - Functions
   - Build errors

### Common Build Issues:

```
TypeError: Cannot read property 'NEXT_PUBLIC_VAPID_PUBLIC_KEY'
```
**Solution:** Environment variables not set during build

```
Module not found: Can't resolve '@/components/ClientCacheManager'
```
**Solution:** File not committed or path issue

## Step 5: Test in Incognito/Private Window

Sometimes cache causes issues:

1. Open **Incognito/Private** window
2. Go to your Netlify URL
3. Try enabling notifications
4. Check console for errors

## Step 6: Check Next.js Build Output

The issue might be that environment variables aren't being picked up. Check this:

1. In your production site, open console and type:
```javascript
console.log('VAPID Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
```

**If undefined:**
- Environment variable not set in Netlify
- Variable name typo
- Need to redeploy after setting variables

## Step 7: Manual Debug Script

Add this to browser console on production:

```javascript
// Check all notification components
(async function debugNotifications() {
  console.log('=== Notification Debug ===')
  
  // 1. Browser support
  console.log('Service Worker supported:', 'serviceWorker' in navigator)
  console.log('Push supported:', 'PushManager' in window)
  console.log('Notification supported:', 'Notification' in window)
  
  // 2. Service worker status
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration()
    console.log('Service Worker registered:', !!reg)
    if (reg) {
      console.log('Service Worker scope:', reg.scope)
      console.log('Service Worker state:', reg.active?.state)
    }
  }
  
  // 3. Permission
  if ('Notification' in window) {
    console.log('Notification permission:', Notification.permission)
  }
  
  // 4. VAPID key (client-side check)
  console.log('Checking for VAPID key in page...')
  // This won't work directly, but check Network tab for API calls
  
  // 5. Push subscription
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    console.log('Push subscription exists:', !!sub)
    if (sub) {
      console.log('Endpoint:', sub.endpoint.substring(0, 50) + '...')
    }
  }
  
  console.log('=== End Debug ===')
})()
```

## Step 8: Check HTTPS and Headers

Push notifications require HTTPS. Check:

1. URL starts with `https://`
2. No mixed content warnings
3. Valid SSL certificate

## Quick Fix Checklist

Try these in order:

### Fix 1: Redeploy with Environment Variables
```
1. Netlify Dashboard → Site settings → Environment variables
2. Add all required VAPID variables
3. Save
4. Deploys → Trigger deploy → Clear cache and deploy
```

### Fix 2: Verify Files Deployed
```
1. Check GitHub repo has:
   - public/sw.js
   - src/components/ClientCacheManager.tsx
   - src/components/NotificationManager.tsx
2. Pull latest and redeploy if missing
```

### Fix 3: Clear Netlify Cache
```
1. Netlify Dashboard → Deploys
2. Trigger deploy → Clear cache and deploy
```

### Fix 4: Check Build Settings
```
1. Netlify Dashboard → Site settings → Build & deploy
2. Build command: npm run build
3. Publish directory: .next
```

## Most Likely Issues (Ranked):

### 🔴 1. Environment Variables Not Set (90% chance)
- VAPID keys not in Netlify environment variables
- Forgot to redeploy after adding them

### 🟡 2. Service Worker Not Deployed (5% chance)
- Build issue
- File not in public folder

### 🟢 3. HTTPS/Security Issue (3% chance)
- Mixed content
- CORS

### 🟢 4. Browser Cache (2% chance)
- Old service worker cached
- Clear site data

## Solution Steps:

1. **Open Netlify Dashboard**
2. **Go to:** Site settings → Environment variables
3. **Add these variables** (copy exactly):
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY = BK29oDR5znF7LwjZ3FkkLh1gCzciBX8lJdpED6v76KiGbHm-9wMIm7inVceM3FyQQTuWEjO5ABmrT0nXFqbn38I
   VAPID_PRIVATE_KEY = nA0tSRAOkqv7ycs-3wRtEBnSx6Oj39uq1sAPGxMJcQY
   VAPID_EMAIL = mailto:arindamgupta077@gmail.com
   CRON_SECRET = lihjdcJaeO4RVLqAf1WFxEtp7T8oQUKb
   NEXT_PUBLIC_SITE_URL = https://anuranan-emp-portal.netlify.app
   ```
4. **Click Save**
5. **Go to Deploys tab**
6. **Click "Trigger deploy" → "Clear cache and deploy"**
7. **Wait for deploy to finish**
8. **Test in incognito window**

## After Fixing:

Open browser console on production and you should see:
```
✅ Service Worker registered
✅ Starting notification setup...
✅ VAPID_PUBLIC_KEY: Set
✅ Permission result: granted
✅ Subscribing to push notifications...
✅ Subscription: {endpoint: "...", keys: {...}}
✅ Server response status: 200
✅ Notification setup complete!
```

If you still see "Processing...", share the **exact console error** and I'll help you fix it!
