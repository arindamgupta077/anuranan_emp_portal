# Troubleshooting: Execution Date Not Showing

## Issue
The execution_date field is not displaying on task cards even though the code is updated.

## Possible Causes & Solutions

### 1. Database Column Not Added Yet ⚠️
**Most likely cause** - You need to run the SQL migration first.

**Solution:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the following SQL:

```sql
ALTER TABLE tasks
ADD COLUMN execution_date DATE;

COMMENT ON COLUMN tasks.execution_date IS 'Optional date when the task should be executed';
```

Or use the file: `supabase/add-execution-date.sql`

### 2. Existing Tasks Don't Have Execution Date
After adding the column, existing tasks will have `execution_date = NULL`, so they won't display anything.

**Solution:**
- Create a NEW task with an execution date using the "Assign New Task" modal
- Or update an existing task in the database to add an execution_date

### 3. Browser Cache
**Solution:**
- Hard refresh the browser: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Open DevTools (F12) and disable cache while DevTools is open

### 4. Check Console for Debug Info
Open browser console (F12) and look for:
```
Sample task data: { ... }
```

Check if the task object includes `execution_date` field.

## Verification Steps

### Step 1: Verify Database Column
Run this SQL in Supabase:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'execution_date';
```

Should return:
```
column_name      | data_type
execution_date   | date
```

### Step 2: Check Existing Data
```sql
SELECT id, title, due_date, execution_date 
FROM tasks 
LIMIT 5;
```

### Step 3: Test Creating New Task
1. Login as CEO
2. Click "Assign Task"
3. Fill all fields including execution date
4. Submit
5. Check if execution date appears on the card

### Step 4: Manually Add Execution Date to Existing Task
```sql
UPDATE tasks 
SET execution_date = '2025-11-10' 
WHERE id = 'your-task-id-here';
```

## Expected Behavior

### Desktop View:
- Due date shows first with clock icon and gray background
- Execution date shows below with clock icon and BLUE background
- Label: "Exec: [date]"

### Mobile View:
- Due date shows with gray/red color (if overdue)
- Execution date shows below with BLUE color
- Label: "Exec: [date]"

### Task Details Modal:
- Shows in a blue card labeled "Execution Date"

## Quick Test
Run this to add execution date to a task:
```sql
UPDATE tasks 
SET execution_date = CURRENT_DATE + INTERVAL '7 days'
WHERE id = (SELECT id FROM tasks LIMIT 1);
```

Then refresh the tasks page and check if you see the blue "Exec:" badge.
