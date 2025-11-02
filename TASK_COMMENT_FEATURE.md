# Task Comment Feature Implementation

## Overview
Added a comment field to the tasks table that allows non-CEO employees to add comments to their assigned tasks.

## Database Migration

### SQL Script Location
`supabase/add-comment-column.sql`

### To Apply Migration
Run this script in your Supabase SQL Editor:
```sql
-- Add comment column to tasks table
ALTER TABLE tasks ADD COLUMN comment TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN tasks.comment IS 'Comment added by the assigned employee about the task';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_tasks_comment ON tasks(id) WHERE comment IS NOT NULL;
```

## Features Implemented

### 1. **Comment Field in Task Details Modal**
   - **For Non-CEO Employees** (assigned to the task):
     - Editable textarea to add/update comments
     - "Save Comment" button with loading state
     - Displays previous comment if exists
     - Amber/yellow color scheme to differentiate from other sections
     - Located at the bottom of the Task Details modal (before action buttons)
   
   - **For CEO**:
     - Read-only view of employee comments
     - Blue color scheme for viewing
     - Only shows if comment exists

### 2. **API Endpoint**
   - **POST `/api/tasks/[id]/comment`**
   - Validates that only the assigned employee can add comments
   - Updates the comment field and updated_by field
   - Returns updated task data

### 3. **Security**
   - Only the assigned employee can add/edit comments
   - CEO can view comments but cannot edit them through this interface
   - Requires authentication

### 4. **UI/UX Features**
   - Auto-loads existing comment when modal opens
   - Success/error toast notifications
   - Loading state while saving
   - Previous comment displayed separately for context
   - Responsive design

## Files Modified

1. **`src/lib/database.types.ts`**
   - Added `comment: string | null` to tasks Row, Insert, and Update types

2. **`src/app/tasks/TasksClient.tsx`**
   - Added comment state management
   - Added useEffect to initialize comment when task selected
   - Added `handleSaveComment` function
   - Added comment section in Task Details modal
   - Import useEffect from React

3. **`src/app/api/tasks/[id]/comment/route.ts`** (NEW)
   - Created PATCH endpoint for saving comments
   - Validates assigned employee
   - Updates comment in database

4. **`supabase/add-comment-column.sql`** (NEW)
   - Database migration script

## How It Works

### For Non-CEO Employees:
1. Employee opens a task they're assigned to
2. Scrolls to bottom of Task Details modal
3. Sees comment textarea with amber/yellow styling
4. Types their comment
5. Clicks "Save Comment" button
6. Comment is saved and toast notification appears
7. Previous comments are shown below the textarea

### For CEO:
1. Opens any task with a comment
2. Sees read-only comment in blue-styled section
3. Can view but cannot edit comments
4. Can still edit other task fields if needed

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Test as non-CEO employee adding a comment to assigned task
- [ ] Test as non-CEO employee updating an existing comment
- [ ] Test as CEO viewing tasks with comments
- [ ] Verify non-CEO cannot comment on tasks not assigned to them
- [ ] Check toast notifications appear correctly
- [ ] Verify comment persists after page refresh

## Notes

- Comments are task-specific and tied to the assigned employee
- Only one comment per task (not a conversation thread)
- Comment updates replace previous comments
- CEO can still edit all task fields including comments through the Edit Task feature
