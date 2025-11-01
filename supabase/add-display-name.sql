-- ============================================
-- ADD DISPLAY_NAME COLUMN TO USERS TABLE
-- ============================================
-- This adds an optional display_name field that can be different from full_name
-- For example: full_name="Arindam Kumar Gupta", display_name="Arindam G."

-- Add display_name column (optional, defaults to full_name if not set)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Set existing users' display_name to their full_name
UPDATE public.users 
SET display_name = full_name 
WHERE display_name IS NULL;

-- Create function to automatically set display_name on insert if not provided
CREATE OR REPLACE FUNCTION set_default_display_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_name IS NULL THEN
        NEW.display_name := NEW.full_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set display_name
DROP TRIGGER IF EXISTS set_display_name_trigger ON public.users;
CREATE TRIGGER set_display_name_trigger
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION set_default_display_name();

-- Add comment
COMMENT ON COLUMN public.users.display_name IS 'Optional display name for user, defaults to full_name if not set';
