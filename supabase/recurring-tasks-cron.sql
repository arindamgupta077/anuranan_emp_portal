-- ============================================
-- RECURRING TASKS SPAWNING FUNCTION
-- ============================================
-- This function should be called daily (via Supabase cron job or external scheduler)
-- to spawn tasks from active recurring task rules
-- ============================================

CREATE OR REPLACE FUNCTION spawn_recurring_tasks()
RETURNS void AS $$
DECLARE
    recurring_rule RECORD;
    should_spawn BOOLEAN;
    current_dow INTEGER; -- day of week (0 = Sunday, 6 = Saturday)
    current_dom INTEGER; -- day of month
BEGIN
    current_dow := EXTRACT(DOW FROM CURRENT_DATE);
    current_dom := EXTRACT(DAY FROM CURRENT_DATE);
    
    FOR recurring_rule IN
        SELECT * FROM public.recurring_tasks
        WHERE is_active = true
        AND start_date <= CURRENT_DATE
        AND (end_date IS NULL OR end_date >= CURRENT_DATE)
        AND (last_spawned_date IS NULL OR last_spawned_date < CURRENT_DATE)
    LOOP
        should_spawn := false;
        
        -- Check if we should spawn based on recurrence type
        IF recurring_rule.recurrence_type = 'WEEKLY' THEN
            -- recurrence_value is day of week (0-6)
            IF current_dow = recurring_rule.recurrence_value THEN
                should_spawn := true;
            END IF;
        ELSIF recurring_rule.recurrence_type = 'MONTHLY' THEN
            -- recurrence_value is day of month (1-31)
            IF current_dom = recurring_rule.recurrence_value THEN
                should_spawn := true;
            END IF;
        END IF;
        
        -- Spawn the task if conditions are met
        IF should_spawn THEN
            INSERT INTO public.tasks (
                title,
                details,
                assigned_to,
                created_by,
                due_date,
                recurring_task_id,
                status
            ) VALUES (
                recurring_rule.title,
                recurring_rule.details,
                recurring_rule.assigned_to,
                recurring_rule.created_by,
                CURRENT_DATE + INTERVAL '7 days', -- Due in 7 days by default
                recurring_rule.id,
                'OPEN'
            );
            
            -- Update last spawned date
            UPDATE public.recurring_tasks
            SET last_spawned_date = CURRENT_DATE
            WHERE id = recurring_rule.id;
            
            RAISE NOTICE 'Spawned recurring task: % for user: %', recurring_rule.title, recurring_rule.assigned_to;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION spawn_recurring_tasks TO authenticated;

-- ============================================
-- HOW TO SET UP AUTOMATIC EXECUTION
-- ============================================
-- Option 1: Use Supabase pg_cron extension (if available)
-- SELECT cron.schedule(
--     'spawn-recurring-tasks',
--     '0 0 * * *', -- Run at midnight every day
--     $$SELECT spawn_recurring_tasks()$$
-- );

-- Option 2: Call this function from your Next.js app via a scheduled API route
-- Create an API route: /api/cron/spawn-tasks
-- Call it daily using a service like:
-- - Netlify Scheduled Functions
-- - GitHub Actions
-- - External cron job service (cron-job.org, etc.)

-- Option 3: Use Supabase Edge Functions with cron trigger
-- ============================================

-- Manual execution for testing:
-- SELECT spawn_recurring_tasks();
