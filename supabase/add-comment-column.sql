-- ============================================
-- ADD COMMENT COLUMN TO TASKS TABLE
-- ============================================
-- This script adds a comment field to the tasks table
-- Run this script in your Supabase SQL Editor
-- ============================================

-- Add comment column to tasks table
ALTER TABLE tasks ADD COLUMN comment TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN tasks.comment IS 'Comment added by the assigned employee about the task';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_tasks_comment ON tasks(id) WHERE comment IS NOT NULL;

