-- Add execution_date column to tasks table
ALTER TABLE tasks
ADD COLUMN execution_date DATE;

-- Add comment to document the column
COMMENT ON COLUMN tasks.execution_date IS 'Optional date when the task should be executed';
