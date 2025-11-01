# Profile Photo Fix for Netlify Deployment

## Problem
Profile photos were not loading when deployed on Netlify because:
1. Next.js wasn't configured to allow external images from Supabase
2. Content Security Policy headers were blocking Supabase images
3. Missing proper CORS and storage bucket configuration in Supabase

## Solutions Implemented

### 1. Next.js Configuration (`next.config.js`)
Added remote image patterns to allow Supabase storage URLs:
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

### 2. Netlify Headers (`netlify.toml`)
Added Content Security Policy to allow Supabase images:
```toml
Content-Security-Policy = "img-src 'self' data: https://*.supabase.co blob:;"
```

### 3. Profile Client Component (`ProfileClient.tsx`)
- Changed from `<img>` to Next.js `<Image>` component for better optimization
- Added error handling with fallback to initials
- Added `unoptimized` flag for Supabase images
- Added cache busting for immediate display after upload

### 4. API Route Enhancement (`api/profile/route.ts`)
- Added cache busting parameter to uploaded photo URLs
- Improved error logging

## Supabase Storage Setup (IMPORTANT)

### Step 1: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `avatars`
3. **Set bucket as PUBLIC** (this is crucial!)

### Step 2: Apply Storage Policies
Run the SQL in `supabase/storage-policies.sql`:
```sql
-- Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (name LIKE 'profile-photos/' || auth.uid()::text || '%')
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Step 3: Configure CORS (if needed)
If you still face CORS issues, add these CORS settings in Supabase Dashboard:
- Go to Storage → avatars bucket → Settings
- Add allowed origins: `*` or your Netlify domain

## Testing Checklist

### Local Testing
- [ ] Can upload profile photo
- [ ] Photo displays immediately after upload
- [ ] Photo persists after page refresh
- [ ] Fallback initials show when no photo

### Production Testing (Netlify)
- [ ] Environment variables are set correctly
- [ ] Supabase bucket is PUBLIC
- [ ] Storage policies are applied
- [ ] Photo uploads successfully
- [ ] Photo displays on profile page
- [ ] Photo displays in navbar (if applicable)
- [ ] No CORS errors in browser console
- [ ] No CSP errors in browser console

## Deployment Steps

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix profile photo loading on Netlify"
   git push
   ```

2. **Verify Supabase Storage:**
   - Ensure `avatars` bucket exists and is PUBLIC
   - Verify storage policies are applied
   - Test upload from local environment

3. **Deploy to Netlify:**
   - Netlify will auto-deploy from your git push
   - Or manually trigger deploy in Netlify dashboard

4. **Test in Production:**
   - Login to deployed app
   - Go to profile page
   - Upload a new photo
   - Verify it displays correctly
   - Check browser console for any errors

## Troubleshooting

### Photo Still Not Loading?

1. **Check Browser Console:**
   - Look for CORS errors
   - Look for CSP violations
   - Look for 404 or 403 errors

2. **Verify Supabase Bucket:**
   ```sql
   -- Check bucket configuration
   SELECT * FROM storage.buckets WHERE name = 'avatars';
   -- Should show: public = true
   ```

3. **Verify Storage Policies:**
   ```sql
   -- List all policies for storage.objects
   SELECT * FROM pg_policies WHERE tablename = 'objects';
   ```

4. **Check Photo URL Format:**
   - Should be: `https://[project].supabase.co/storage/v1/object/public/avatars/profile-photos/[user-id]-[timestamp].[ext]`
   - Verify in database: `SELECT profile_photo_url FROM users WHERE id = '[your-user-id]';`

5. **Test Direct URL:**
   - Copy the `profile_photo_url` from database
   - Paste in browser address bar
   - Should display the image directly
   - If not, bucket is not public or policies are wrong

### Common Issues

**Issue: 403 Forbidden**
- Solution: Make sure bucket is set to PUBLIC

**Issue: CORS Error**
- Solution: Add CORS configuration in Supabase Storage settings

**Issue: CSP Violation**
- Solution: Verify `Content-Security-Policy` header in netlify.toml

**Issue: Image Not Found (404)**
- Solution: Check if file actually uploaded to storage bucket

## Additional Notes

- Profile photos are stored in `avatars/profile-photos/` folder
- Filenames follow pattern: `[user-id]-[timestamp].[extension]`
- Old photos are NOT automatically deleted (you may want to add cleanup logic)
- Maximum file size: 5MB (configured in API route)
- Allowed formats: All image types (jpg, png, gif, webp, etc.)

## Performance Considerations

- Using Next.js `Image` component provides automatic optimization
- `unoptimized` flag is used for Supabase images to avoid processing delays
- Cache busting ensures immediate display after upload
- Profile page has `revalidate = 0` to always show latest photo
