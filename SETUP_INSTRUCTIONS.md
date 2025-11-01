# 🚀 Anuranan Employee Portal - Complete Setup Guide

## ✅ What Has Been Created

I've set up the foundational structure of your Anuranan Employee Portal. Here's what's ready:

### 📁 Project Structure
- ✅ Next.js 14 with App Router and TypeScript
- ✅ Tailwind CSS configuration
- ✅ Supabase client setup (client, server, middleware)
- ✅ Complete database schema with RLS policies
- ✅ Recurring tasks cron function
- ✅ Type definitions for database tables
- ✅ Utility functions (date, validation, helpers)
- ✅ Reusable UI components (Button, Input, Textarea, Select, Modal, Badge, Card, Toast)
- ✅ Login page
- ✅ Offline page
- ✅ PWA manifest and service worker
- ✅ Netlify configuration
- ✅ Comprehensive documentation

## 🔧 Next Steps to Complete the Application

### STEP 1: Install Dependencies (REQUIRED - Do this first!)

```powershell
cd c:\VSCODE\anuranan_emp_portal
npm install
```

This will install all required packages and resolve TypeScript errors.

### STEP 2: Set Up Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing
3. Navigate to **SQL Editor**
4. Run `supabase/schema.sql` (copy entire file, paste, and run)
5. Run `supabase/recurring-tasks-cron.sql`
6. Verify tables exist in **Table Editor**

### STEP 3: Create CEO User

1. **Authentication** > **Users** > **Add user**
2. Enter email: `admin@anuranan.com` (or your choice)
3. Enter password
4. Note the user ID (UUID)
5. Go to **Table Editor** > **roles** table
6. Copy the UUID of the 'CEO' role
7. Go to **users** table
8. Find your user and set `role_id` to CEO role UUID
9. Ensure `is_active` = true

### STEP 4: Configure Environment Variables

```powershell
copy .env.example .env.local
```

Edit `.env.local` and add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard** > **Settings** > **API**

### STEP 5: Complete the Application Pages

I've created the foundational files. You now need to complete these pages:

#### A. Dashboard Page (`src/app/dashboard/page.tsx`)

Create a dashboard showing:
- Stat cards (active tasks, self-tasks count, pending leaves)
- Quick action buttons
- Welcome message with user name
- Different stats for CEO vs employees

**Key Features:**
- Fetch user data from Supabase
- Query tasks, self_tasks, leaves tables
- Show aggregated counts
- CEO sees org-wide stats, others see personal stats

#### B. Tasks Page (`src/app/tasks/page.tsx`)

Features needed:
- Task list with filters (status: OPEN, IN_PROGRESS, COMPLETED)
- Status update dropdown
- Task details modal (click on task to view details)
- CEO: "Assign Task" button + modal
- Overdue indicator (due_date < today and status != COMPLETED)
- Pagination (10 per page)

#### C. Self Tasks Page (`src/app/self-tasks/page.tsx`)

Features needed:
- Form: date, details, visibility toggle (PUBLIC/PRIVATE)
- List of self tasks with edit/delete buttons
- CEO view: filter by employee dropdown + date range
- Employee view: only their own tasks

#### D. Leaves Page (`src/app/leaves/page.tsx`)

Features needed:
- Leave request form (start date, end date, reason)
- Calculate duration automatically (inclusive days)
- List of leave requests with status badges
- Employee: edit/delete pending requests only
- CEO: approve/reject buttons, view all leaves
- Filter by status and date range

#### E. Admin Page (`src/app/admin/page.tsx`)

Features needed (CEO only):
- **Tab 1: Employees**
  - List all employees with role and status
  - "Add Employee" button + modal (name, email, password, role)
  - Deactivate/reactivate toggle
  - Reset password button
  
- **Tab 2: Create Task**
  - Task creation form (same as Tasks page modal)
  
- **Tab 3: Recurring Tasks**
  - Form: title, details, assignee, type (WEEKLY/MONTHLY)
  - If WEEKLY: day of week dropdown (0-6)
  - If MONTHLY: day of month dropdown (1-31)
  - Start date, optional end date
  - List of existing recurring rules with active/inactive toggle

- **Tab 4: Reports Link**
  - Button to navigate to reports page

#### F. Reports Page (`src/app/reports/page.tsx`)

Features needed (CEO only):
- **Performance Report**: completion rate, overdue tasks per employee
- **Tasks Summary**: total by status, by employee, completion rate
- **Recurring Tasks**: rules list with spawn count, completion rate
- **Leaves Summary**: total days per employee
- CSV export button for performance report

#### G. Profile Page (`src/app/profile/page.tsx`)

Features needed:
- Display: user name, email, role, account status, user ID
- Role description from roles table
- Quick action buttons (go to dashboard, tasks, etc.)
- CEO: link to admin panel

### STEP 6: Create API Routes for Actions

You'll need these API routes:

#### `src/app/api/tasks/route.ts`
- POST: Create task
- GET: List tasks with filters
- PATCH: Update task status

#### `src/app/api/self-tasks/route.ts`
- POST: Create self task
- GET: List self tasks
- PATCH: Update self task
- DELETE: Delete self task

#### `src/app/api/leaves/route.ts`
- POST: Create leave request
- GET: List leaves
- PATCH: Update leave (approve/reject)
- DELETE: Delete leave

#### `src/app/api/admin/employees/route.ts`
- POST: Create employee
- GET: List employees
- PATCH: Update employee (deactivate, reset password)

#### `src/app/api/recurring-tasks/route.ts`
- POST: Create recurring task rule
- GET: List recurring rules
- PATCH: Toggle active status

#### `src/app/api/cron/spawn-tasks/route.ts`
- GET: Call `spawn_recurring_tasks()` function
- This will be called daily by Netlify or external cron

### STEP 7: Add Navigation Component

Create `src/components/layout/Navbar.tsx`:
- Logo and app name
- Navigation links (Dashboard, Tasks, Self Tasks, Leaves, Admin (CEO only), Profile)
- Logout button
- Mobile responsive with hamburger menu

Update `src/app/layout.tsx` to wrap pages with Navbar (except login page).

### STEP 8: Implement Data Fetching Patterns

Use this pattern in pages:

```typescript
import { createServerClient } from '@/lib/supabase/server'

export default async function PageName() {
  const supabase = await createServerClient()
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  
  // Fetch user profile with role
  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', session.user.id)
    .single()
    
  const isCEO = user.role.name === 'CEO'
  
  // Fetch data based on role
  // ...
  
  return <YourPageComponent user={user} data={data} />
}
```

### STEP 9: Test Locally

```powershell
npm run dev
```

Open http://localhost:3000

Test:
1. Login with CEO credentials
2. Navigate all pages
3. Create tasks, self-tasks, leaves
4. Test filters and pagination
5. Test admin functions
6. Test recurring task rules

### STEP 10: Deploy to Netlify

#### Option A: GitHub + Netlify (Recommended)

1. Initialize git and push to GitHub:
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [Netlify](https://netlify.com)
3. **Add new site** > **Import from Git**
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy

#### Option B: Netlify CLI

```powershell
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### STEP 11: Set Up Recurring Tasks Cron

Choose one option:

**Option A: Netlify Scheduled Functions**
- Create `netlify/functions/spawn-tasks.ts`
- Configure to run daily at midnight
- Netlify will call it automatically

**Option B: External Cron (cron-job.org)**
- Create account on cron-job.org
- Add job: `https://your-app.netlify.app/api/cron/spawn-tasks`
- Schedule: daily at 00:00

**Option C: Supabase pg_cron** (if available in your plan)
- Run in Supabase SQL Editor:
```sql
SELECT cron.schedule(
  'spawn-recurring-tasks',
  '0 0 * * *',
  $$SELECT spawn_recurring_tasks()$$
);
```

## 📝 Code Templates to Help You

### Dashboard Stats Query Example

```typescript
// Get task counts
const { count: activeTasks } = await supabase
  .from('tasks')
  .select('*', { count: 'exact', head: true })
  .in('status', ['OPEN', 'IN_PROGRESS'])
  .eq(isCEO ? '' : 'assigned_to', isCEO ? '' : user.id)

// Get self task count
const { count: selfTasksCount } = await supabase
  .from('self_tasks')
  .select('*', { count: 'exact', head: true })
  .eq(isCEO ? '' : 'user_id', isCEO ? '' : user.id)

// Get pending leaves
const { count: pendingLeaves } = await supabase
  .from('leaves')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'PENDING')
  .eq(isCEO ? '' : 'user_id', isCEO ? '' : user.id)
```

### Task List Query Example

```typescript
const { data: tasks } = await supabase
  .from('tasks')
  .select(`
    *,
    assigned_user:users!assigned_to(id, full_name, email),
    created_user:users!created_by(id, full_name)
  `)
  .eq(isCEO ? '' : 'assigned_to', isCEO ? '' : user.id)
  .in('status', filters.status || ['OPEN', 'IN_PROGRESS'])
  .order('due_date', { ascending: true })
  .range(page * 10, (page + 1) * 10 - 1)
```

### Create Task Example

```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title,
    details,
    assigned_to: assigneeId,
    created_by: user.id,
    due_date: dueDate,
    status: 'OPEN'
  })
  .select()
  .single()
```

## 🎯 Priority Order

1. **Install dependencies** (REQUIRED FIRST!)
2. Set up Supabase database
3. Create CEO user
4. Add environment variables
5. Test login page
6. Build Dashboard page
7. Build Tasks page
8. Build Self Tasks page
9. Build Leaves page
10. Build Admin Panel
11. Build Reports page
12. Build Profile page
13. Add Navbar component
14. Test everything locally
15. Deploy to Netlify
16. Set up recurring tasks cron

## 🆘 Need Help?

- **Database issues**: Check `supabase/README.md`
- **Type errors**: Run `npm install` first
- **Auth issues**: Verify Supabase credentials in `.env.local`
- **Deployment issues**: Check Netlify build logs

## ✨ Tips

- Use the existing UI components for consistency
- Follow the type definitions in `lib/types.ts`
- Use utility functions in `lib/utils/`
- Check database RLS policies if you get permission errors
- Test with both CEO and employee accounts
- Use browser DevTools to debug API calls

---

**Good luck building your employee portal! The foundation is solid, now bring it to life! 🚀**
