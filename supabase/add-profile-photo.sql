-- Add profile photo URL column to users table
-- Run this script in your Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.users.profile_photo_url IS 'URL to the user profile photo stored in Supabase Storage';
