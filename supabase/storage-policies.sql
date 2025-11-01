-- ============================================
-- STORAGE BUCKET POLICIES FOR PROFILE PHOTOS
-- ============================================
-- Run this script in Supabase SQL Editor after creating the 'avatars' bucket
-- Make sure the bucket is set to PUBLIC
-- ============================================

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

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name LIKE 'profile-photos/' || auth.uid()::text || '%')
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (name LIKE 'profile-photos/' || auth.uid()::text || '%')
);
