# Service Worker 404 Fix - Deployed ✅

## Problem
The notification system worked perfectly on localhost but failed on Netlify production with:
- "Processing..." stuck state
- 404 error for `/sw.js`
- Console error: "bad HTTP response code (404) was received when fetching the script"

## Root Cause
The `@netlify/plugin-nextjs` doesn't automatically serve files from the `public/` folder at the root URL in production builds. While Next.js dev server does this automatically, the production build on Netlify requires explicit configuration.

## Solution Implemented

### 1. Build Script (`scripts/copy-sw.js`)
Created a post-build script that copies the service worker and manifest from `public/` to `.next/static/`:
```javascript
fs.copyFileSync('public/sw.js', '.next/static/sw.js');
fs.copyFileSync('public/manifest.json', '.next/static/manifest.json');
```

### 2. Updated Package.json
Modified the build command to run the copy script after Next.js build:
```json
"build": "next build && node scripts/copy-sw.js"
```

### 3. Netlify Redirects
Added redirects in `netlify.toml` to serve the files from `/_next/static/`:
```toml
[[redirects]]
  from = "/sw.js"
  to = "/_next/static/sw.js"
  status = 200

[[redirects]]
  from = "/manifest.json"
  to = "/_next/static/manifest.json"
  status = 200
```

### 4. Next.js Headers
Added proper headers for service worker in `next.config.js`:
```javascript
{
  source: '/sw.js',
  headers: [
    { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
    { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
    { key: 'Service-Worker-Allowed', value: '/' }
  ]
}
```

## Deployment Status
✅ Code pushed to GitHub
✅ Build script tested locally
✅ Files verified in `.next/static/`
⏳ Waiting for Netlify deployment to complete

## Testing Steps
Once Netlify deployment finishes:

1. **Open Production URL**: https://anuranan-emp-portal.netlify.app
2. **Open DevTools Console**: Check for any errors
3. **Verify Service Worker**: 
   - Go to DevTools → Application → Service Workers
   - Should show "Activated and running"
4. **Test Notification Banner**:
   - Should appear at top of page
   - Click "Enable Notifications"
   - Grant permission when prompted
   - Banner should disappear
5. **Check Subscription**:
   - Console should show: "Push subscription saved successfully"
6. **Verify in Database**:
   - Check `push_subscriptions` table in Supabase
   - Should have new entry with your user ID

## Expected Behavior
- ✅ Service worker registers successfully
- ✅ Notification permission prompt appears
- ✅ Subscription saved to database
- ✅ No "Processing..." stuck state
- ✅ No 404 errors in console

## Rollback Plan
If issues persist, revert with:
```bash
git revert HEAD
git push
```

## Next Steps
1. Wait for Netlify deployment (~2-3 minutes)
2. Test on production URL
3. If successful, test push notifications using:
   ```bash
   curl -X POST https://anuranan-emp-portal.netlify.app/api/notifications/send \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Notification",
       "body": "Service worker is working!",
       "userId": "your-user-id"
     }'
   ```

## Technical Notes
- Service worker MUST be served from root (`/sw.js`) for security
- Netlify + Next.js requires explicit file copying and redirects
- `_next/static/` directory is properly served by Netlify
- Headers ensure proper MIME type and caching behavior
