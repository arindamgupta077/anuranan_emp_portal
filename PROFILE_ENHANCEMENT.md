# Profile Page Enhancement Guide

## Overview
Enhanced profile page with improved UI and profile photo upload functionality.

## Features Added

### 1. Profile Photo Upload
- Click the camera icon to upload a profile photo
- Supported formats: All image types (jpg, png, gif, etc.)
- Maximum file size: 5MB
- Photos stored in Supabase Storage
- Automatic URL generation and database update

### 2. Improved UI
- Larger profile photo display (128x128)
- Gradient background for initials when no photo uploaded
- Better spacing and layout
- Responsive design for mobile and desktop
- Enhanced visual hierarchy with icons and badges
- Styled account information cards

### 3. Edit Profile Modal
- Update full name
- Visual feedback during updates
- Form validation

## Setup Instructions

### Step 1: Database Migration
Run the following SQL in your Supabase SQL Editor:

```sql
-- Add profile photo URL column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

COMMENT ON COLUMN public.users.profile_photo_url IS 'URL to the user profile photo stored in Supabase Storage';
```

Or use the migration file:
```bash
# The SQL file is located at: supabase/add-profile-photo.sql
# Copy and paste its contents into Supabase SQL Editor
```

### Step 2: Create Storage Bucket
1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `avatars`
3. Make it public (so profile photos can be accessed)
4. Set the following policies:

**Insert Policy:**
```sql
-- Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (name LIKE 'profile-photos/' || auth.uid()::text || '%')
);
```

**Select Policy:**
```sql
-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Update Policy:**
```sql
-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name LIKE 'profile-photos/' || auth.uid()::text || '%')
);
```

**Delete Policy:**
```sql
-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name LIKE 'profile-photos/' || auth.uid()::text || '%')
);
```

### Step 3: Build and Test
```bash
npm run build
npm run dev
```

## Files Modified

1. **src/app/profile/ProfileClient.tsx**
   - Added photo upload functionality
   - Added edit profile modal
   - Improved UI with better styling
   - Added loading states and error handling

2. **src/app/profile/page.tsx**
   - Updated to fetch profile_photo_url
   - Added status mapping

3. **src/lib/database.types.ts**
   - Added profile_photo_url field to users table types

4. **src/app/api/profile/route.ts** (NEW)
   - POST endpoint for photo upload
   - PATCH endpoint for profile updates
   - File validation and storage handling

5. **supabase/add-profile-photo.sql** (NEW)
   - SQL migration to add profile_photo_url column

## API Endpoints

### POST /api/profile
Upload profile photo
- **Method:** POST
- **Body:** FormData with 'file' field
- **Returns:** { profile_photo_url: string }

### PATCH /api/profile
Update profile information
- **Method:** PATCH
- **Body:** { full_name?: string, profile_photo_url?: string }
- **Returns:** Updated user object

## Usage

### Uploading Profile Photo
1. Navigate to Profile page
2. Click the camera icon on the profile photo
3. Select an image file
4. Wait for upload to complete
5. Photo will be displayed immediately

### Editing Profile
1. Click "Edit Profile" button
2. Modify full name
3. Click "Save Changes"
4. Profile will be updated

## Technical Details

- **Storage Path:** `avatars/profile-photos/{userId}-{timestamp}.{ext}`
- **File Naming:** Includes user ID and timestamp to prevent conflicts
- **Photo Display:** Falls back to initials if no photo uploaded
- **Responsive Design:** Optimized for mobile and desktop
- **Loading States:** Visual feedback during uploads and updates

## Validation

- File type: Must be an image
- File size: Maximum 5MB
- Name: Cannot be empty
- Authentication: Required for all operations

## Error Handling

- File validation errors
- Upload failures
- Network errors
- Authentication errors
- All errors shown via toast notifications

## Security

- All operations require authentication
- Storage policies restrict access to user's own photos
- File type and size validation
- CSRF protection via API routes
