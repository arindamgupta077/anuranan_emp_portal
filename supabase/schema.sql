-- ============================================
-- ANURANAN EMPLOYEE PORTAL - DATABASE SCHEMA
-- ============================================
-- This script creates all database objects for the Anuranan Employee Portal
-- Run this script in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_number SERIAL UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED')),
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_date DATE,
    recurring_task_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task history table
CREATE TABLE IF NOT EXISTS public.task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self tasks table
CREATE TABLE IF NOT EXISTS public.self_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    task_date DATE NOT NULL,
    details TEXT NOT NULL,
    visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaves table
CREATE TABLE IF NOT EXISTS public.leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Recurring tasks table
CREATE TABLE IF NOT EXISTS public.recurring_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    details TEXT,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    recurrence_type VARCHAR(20) NOT NULL CHECK (recurrence_type IN ('WEEKLY', 'MONTHLY')),
    recurrence_value INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    last_spawned_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON public.tasks(recurring_task_id);

CREATE INDEX IF NOT EXISTS idx_task_history_task ON public.task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_changed_by ON public.task_history(changed_by);

CREATE INDEX IF NOT EXISTS idx_self_tasks_user ON public.self_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_self_tasks_date ON public.self_tasks(task_date);

CREATE INDEX IF NOT EXISTS idx_leaves_user ON public.leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON public.leaves(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_recurring_tasks_assigned ON public.recurring_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_active ON public.recurring_tasks(is_active);

-- ============================================
-- 3. INSERT DEFAULT ROLES
-- ============================================

INSERT INTO public.roles (name, description) VALUES
    ('CEO', 'Chief Executive Officer - Full admin access'),
    ('Manager', 'Manager - Standard employee access'),
    ('Teacher', 'Teacher - Standard employee access'),
    ('Operation Manager', 'Operation Manager - Standard employee access'),
    ('Editor', 'Editor - Standard employee access')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. CREATE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create task history on status change
CREATE OR REPLACE FUNCTION create_task_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.task_history (task_id, changed_by, old_status, new_status)
        VALUES (NEW.id, NEW.updated_by, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user role name
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
    SELECT r.name
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is CEO
CREATE OR REPLACE FUNCTION is_ceo(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        WHERE u.id = user_id AND r.name = 'CEO'
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Add updated_by column to tasks for history tracking
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id);

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_self_tasks_updated_at ON public.self_tasks;
CREATE TRIGGER update_self_tasks_updated_at
    BEFORE UPDATE ON public.self_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaves_updated_at ON public.leaves;
CREATE TRIGGER update_leaves_updated_at
    BEFORE UPDATE ON public.leaves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_tasks_updated_at ON public.recurring_tasks;
CREATE TRIGGER update_recurring_tasks_updated_at
    BEFORE UPDATE ON public.recurring_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for task history
DROP TRIGGER IF EXISTS create_task_history_trigger ON public.tasks;
CREATE TRIGGER create_task_history_trigger
    AFTER UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION create_task_history();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Roles policies (everyone can read)
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles"
    ON public.roles FOR SELECT
    USING (true);

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "CEO can view all users" ON public.users;
CREATE POLICY "CEO can view all users"
    ON public.users FOR SELECT
    USING (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can insert users" ON public.users;
CREATE POLICY "CEO can insert users"
    ON public.users FOR INSERT
    WITH CHECK (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can update users" ON public.users;
CREATE POLICY "CEO can update users"
    ON public.users FOR UPDATE
    USING (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Tasks policies
DROP POLICY IF EXISTS "Users can view assigned tasks" ON public.tasks;
CREATE POLICY "Users can view assigned tasks"
    ON public.tasks FOR SELECT
    USING (assigned_to = auth.uid() OR is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can insert tasks" ON public.tasks;
CREATE POLICY "CEO can insert tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can update assigned tasks" ON public.tasks;
CREATE POLICY "Users can update assigned tasks"
    ON public.tasks FOR UPDATE
    USING (assigned_to = auth.uid() OR is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can delete tasks" ON public.tasks;
CREATE POLICY "CEO can delete tasks"
    ON public.tasks FOR DELETE
    USING (is_ceo(auth.uid()));

-- Task history policies
DROP POLICY IF EXISTS "Users can view task history for their tasks" ON public.task_history;
CREATE POLICY "Users can view task history for their tasks"
    ON public.task_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = task_history.task_id
            AND (tasks.assigned_to = auth.uid() OR is_ceo(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "System can insert task history" ON public.task_history;
CREATE POLICY "System can insert task history"
    ON public.task_history FOR INSERT
    WITH CHECK (true);

-- Self tasks policies
DROP POLICY IF EXISTS "Users can view own self tasks" ON public.self_tasks;
CREATE POLICY "Users can view own self tasks"
    ON public.self_tasks FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "CEO can view all public self tasks" ON public.self_tasks;
CREATE POLICY "CEO can view all public self tasks"
    ON public.self_tasks FOR SELECT
    USING (visibility = 'PUBLIC' OR is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own self tasks" ON public.self_tasks;
CREATE POLICY "Users can insert own self tasks"
    ON public.self_tasks FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own self tasks" ON public.self_tasks;
CREATE POLICY "Users can update own self tasks"
    ON public.self_tasks FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own self tasks" ON public.self_tasks;
CREATE POLICY "Users can delete own self tasks"
    ON public.self_tasks FOR DELETE
    USING (user_id = auth.uid());

-- Leaves policies
DROP POLICY IF EXISTS "Users can view own leaves" ON public.leaves;
CREATE POLICY "Users can view own leaves"
    ON public.leaves FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "CEO can view all leaves" ON public.leaves;
CREATE POLICY "CEO can view all leaves"
    ON public.leaves FOR SELECT
    USING (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own leaves" ON public.leaves;
CREATE POLICY "Users can insert own leaves"
    ON public.leaves FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pending leaves" ON public.leaves;
CREATE POLICY "Users can update own pending leaves"
    ON public.leaves FOR UPDATE
    USING (user_id = auth.uid() AND status = 'PENDING')
    WITH CHECK (user_id = auth.uid() AND status = 'PENDING');

DROP POLICY IF EXISTS "CEO can update all leaves" ON public.leaves;
CREATE POLICY "CEO can update all leaves"
    ON public.leaves FOR UPDATE
    USING (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own pending leaves" ON public.leaves;
CREATE POLICY "Users can delete own pending leaves"
    ON public.leaves FOR DELETE
    USING (user_id = auth.uid() AND status = 'PENDING');

DROP POLICY IF EXISTS "CEO can delete leaves" ON public.leaves;
CREATE POLICY "CEO can delete leaves"
    ON public.leaves FOR DELETE
    USING (is_ceo(auth.uid()));

-- Recurring tasks policies
DROP POLICY IF EXISTS "CEO can view all recurring tasks" ON public.recurring_tasks;
CREATE POLICY "CEO can view all recurring tasks"
    ON public.recurring_tasks FOR SELECT
    USING (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "Users can view assigned recurring tasks" ON public.recurring_tasks;
CREATE POLICY "Users can view assigned recurring tasks"
    ON public.recurring_tasks FOR SELECT
    USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "CEO can insert recurring tasks" ON public.recurring_tasks;
CREATE POLICY "CEO can insert recurring tasks"
    ON public.recurring_tasks FOR INSERT
    WITH CHECK (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can update recurring tasks" ON public.recurring_tasks;
CREATE POLICY "CEO can update recurring tasks"
    ON public.recurring_tasks FOR UPDATE
    USING (is_ceo(auth.uid()));

DROP POLICY IF EXISTS "CEO can delete recurring tasks" ON public.recurring_tasks;
CREATE POLICY "CEO can delete recurring tasks"
    ON public.recurring_tasks FOR DELETE
    USING (is_ceo(auth.uid()));

-- ============================================
-- 7. CREATE FUNCTION TO HANDLE USER CREATION
-- ============================================

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        (SELECT id FROM public.roles WHERE name = 'Teacher' LIMIT 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. UTILITY FUNCTIONS FOR REPORTS
-- ============================================

-- Function to calculate task completion rate
CREATE OR REPLACE FUNCTION calculate_completion_rate(user_id UUID, start_date DATE, end_date DATE)
RETURNS NUMERIC AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM public.tasks
    WHERE assigned_to = user_id
    AND created_at::DATE BETWEEN start_date AND end_date;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM public.tasks
    WHERE assigned_to = user_id
    AND status = 'COMPLETED'
    AND created_at::DATE BETWEEN start_date AND end_date;
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((completed_tasks::NUMERIC / total_tasks::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count overdue tasks
CREATE OR REPLACE FUNCTION count_overdue_tasks(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.tasks
        WHERE assigned_to = user_id
        AND status != 'COMPLETED'
        AND due_date < CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE tasks_task_number_seq TO authenticated;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT ON public.task_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.self_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaves TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_tasks TO authenticated;
GRANT SELECT ON public.roles TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION is_ceo TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_completion_rate TO authenticated;
GRANT EXECUTE ON FUNCTION count_overdue_tasks TO authenticated;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Copy .env.example to .env.local in your Next.js project
-- 2. Add your Supabase URL and anon key to .env.local
-- 3. Create your first CEO user through Supabase dashboard
-- 4. Update the user's role_id to CEO role in the users table
-- ============================================
