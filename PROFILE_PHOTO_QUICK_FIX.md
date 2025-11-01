# Quick Fix Verification for Profile Photos

## What Was Fixed
- ✅ Added Next.js remote image patterns for Supabase
- ✅ Updated Content Security Policy headers for Netlify
- ✅ Changed from `<img>` to Next.js `<Image>` component
- ✅ Added error handling and fallback display
- ✅ Added cache busting for immediate photo updates

## Before Deploying - Verify Supabase Setup

### 1. Check Storage Bucket Exists
```sql
SELECT * FROM storage.buckets WHERE name = 'avatars';
```
Should return: `public = true`

### 2. Create Bucket if Missing
In Supabase Dashboard:
1. Go to Storage
2. Click "New bucket"
3. Name: `avatars`
4. **Important:** Make it PUBLIC ✓
5. Click "Create bucket"

### 3. Apply Storage Policies
Copy and run the SQL from `supabase/storage-policies.sql` in Supabase SQL Editor

## Deploy to Netlify

```bash
git add .
git commit -m "Fix profile photo loading on Netlify with Next.js Image optimization"
git push
```

Netlify will automatically deploy your changes.

## Test After Deployment

1. **Login to your Netlify app**
   - Go to: `https://your-app.netlify.app/login`

2. **Navigate to Profile**
   - Click on your name/profile icon
   - Or go to: `https://your-app.netlify.app/profile`

3. **Test Upload**
   - Click the camera icon on profile photo
   - Select an image (< 5MB)
   - Photo should upload and display immediately

4. **Verify Persistence**
   - Refresh the page
   - Photo should still be visible
   - Check browser console for any errors

5. **Test Fallback**
   - If you have an admin account, check other users
   - Users without photos should show initials

## Browser Console Check

Open browser DevTools (F12) and verify:
- ✅ No CORS errors
- ✅ No CSP violations  
- ✅ No 404 errors for images
- ✅ No 403 Forbidden errors
- ✅ Image loads from Supabase URL

## If Photo Still Not Loading

### Check 1: Image URL Format
Look at the `src` in the image element:
```
https://[project-id].supabase.co/storage/v1/object/public/avatars/profile-photos/[user-id]-[timestamp].jpg
```

### Check 2: Test Direct URL
Copy the image URL from DevTools and paste in new tab. Should show the image.

### Check 3: Verify Environment Variables
In Netlify Dashboard → Site settings → Environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### Check 4: Storage Bucket is Public
In Supabase:
- Storage → avatars → Settings
- Ensure "Public bucket" is enabled

### Check 5: Clear Cache
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Or open in incognito mode

## Success Indicators

✅ Profile photo uploads without errors
✅ Photo displays immediately after upload  
✅ Photo persists after page refresh
✅ Photo loads in production (Netlify)
✅ No console errors
✅ Fallback initials show when no photo exists

## Need More Help?

See detailed troubleshooting in `PROFILE_PHOTO_FIX.md`
