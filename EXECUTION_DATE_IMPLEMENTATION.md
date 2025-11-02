# Add Execution Date to Tasks - Implementation Guide

## Database Migration Required

To add the `execution_date` column to the tasks table, run the following SQL command in your Supabase SQL Editor:

```sql
-- Add execution_date column to tasks table
ALTER TABLE tasks
ADD COLUMN execution_date DATE;

-- Add comment to document the column
COMMENT ON COLUMN tasks.execution_date IS 'Optional date when the task should be executed';
```

**File Location:** `supabase/add-execution-date.sql`

## How to Run the Migration

### Option 1: Using Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the SQL from `supabase/add-execution-date.sql`
4. Paste and execute the query

### Option 2: Using Supabase CLI (if installed)
```bash
supabase db push
```

## Changes Made to the Code

### 1. Updated Database Types (`src/lib/database.types.ts`)
- Added `execution_date: string | null` to tasks Row, Insert, and Update types

### 2. Updated Task Form (`src/app/tasks/TasksClient.tsx`)
- Added `execution_date` field to the assign task form state
- Added new date input field in the "Assign New Task" modal
- The execution date field is optional and has a helper text
- Displayed in a 2-column grid layout alongside Due Date for better UX

### 3. Updated Task Details Display
- Added execution date display in the task details modal
- Shows in a blue-colored card when the execution date is set
- Uses the same date formatting as other date fields

## Features
- ✅ Optional field - no validation required
- ✅ Side-by-side layout with Due Date (responsive grid)
- ✅ Helper text explaining the field purpose
- ✅ Displayed in task details modal when set
- ✅ Consistent styling with other date fields

## Next Steps
1. Run the SQL migration in Supabase
2. Test creating a new task with execution date
3. Verify the execution date appears in task details
4. Consider adding execution date to the API endpoint if not already included
