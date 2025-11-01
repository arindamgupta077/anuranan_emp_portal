# 📋 Anuranan Employee Portal - Implementation Checklist

## ✅ Foundation Complete (Done by AI)

- [x] Next.js 14 project structure with TypeScript
- [x] Tailwind CSS configuration  
- [x] Supabase client setup (client, server, middleware)
- [x] Complete database schema with RLS policies
- [x] Type definitions and utility functions
- [x] Reusable UI components (Button, Input, Select, Modal, Badge, Card, Toast)
- [x] Login page
- [x] Offline page
- [x] PWA manifest and service worker
- [x] Netlify configuration
- [x] Comprehensive documentation

## 🔧 Setup & Configuration (Do First!)

- [ ] Run `npm install` to install all dependencies
- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Run `supabase/recurring-tasks-cron.sql` in Supabase SQL Editor
- [ ] Create CEO user in Supabase Authentication
- [ ] Update CEO user's role_id in users table
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Supabase URL and API key to `.env.local`
- [ ] Create PWA icons (see `public/ICONS_README.md`)

## 📄 Pages to Build

### Dashboard (`src/app/dashboard/page.tsx`)
- [ ] Fetch current user with role
- [ ] Display stat cards (active tasks, self-tasks, pending leaves)
- [ ] Different stats for CEO vs employees
- [ ] Quick action buttons (View Tasks, Log Self-Task, Request Leave)
- [ ] CEO additional actions (Assign Task, Manage Employees)
- [ ] Welcome message with user name

### Tasks (`src/app/tasks/page.tsx`)
- [ ] Fetch tasks (all for CEO, assigned only for employees)
- [ ] Task list with status badges
- [ ] Filter by status (default: OPEN + IN_PROGRESS)
- [ ] Status update dropdown (inline)
- [ ] Task details modal (click to view)
- [ ] Overdue indicator (red flag if due_date < today)
- [ ] CEO: "Assign Task" button + modal
- [ ] Pagination (10 per page)

### Self Tasks (`src/app/self-tasks/page.tsx`)
- [ ] Form: date picker, details textarea, visibility toggle
- [ ] Submit button with validation
- [ ] List of self tasks with timestamps
- [ ] Edit and delete buttons (own tasks only)
- [ ] CEO: employee filter dropdown
- [ ] CEO: date range filter
- [ ] Public/Private visibility indicators

### Leaves (`src/app/leaves/page.tsx`)
- [ ] Leave request form (start date, end date, reason)
- [ ] Auto-calculate duration (inclusive days)
- [ ] Validation: end_date >= start_date
- [ ] List of leave requests with status
- [ ] Duration display (e.g., "5 days")
- [ ] Employee: edit/delete pending requests only
- [ ] CEO: approve/reject buttons for all leaves
- [ ] CEO: view all employees' leaves
- [ ] Employee: view own leaves only
- [ ] Filter by status and date range

### Admin (`src/app/admin/page.tsx`) - CEO Only
- [ ] Redirect non-CEO users
- [ ] Tab navigation (Employees, Create Task, Recurring Tasks, Reports)

#### Tab 1: Employees
- [ ] List all employees with role and active status
- [ ] "Add Employee" button
- [ ] Add employee modal (name, email, password, role dropdown)
- [ ] Deactivate/Reactivate toggle per employee
- [ ] Reset password button (generates new password)
- [ ] Display role badges

#### Tab 2: Create Task
- [ ] Task form (title, details, assignee dropdown, due date)
- [ ] Submit button
- [ ] Success/error toast notifications

#### Tab 3: Recurring Tasks
- [ ] Form: title, details, assignee dropdown
- [ ] Recurrence type: WEEKLY or MONTHLY (radio buttons)
- [ ] If WEEKLY: day of week dropdown (Sunday-Saturday)
- [ ] If MONTHLY: day of month dropdown (1-31)
- [ ] Start date, optional end date
- [ ] Summary preview before submit
- [ ] List of existing recurring rules
- [ ] Active/Inactive toggle per rule
- [ ] Last spawned date display

#### Tab 4: Reports
- [ ] Link/button to navigate to Reports page

### Reports (`src/app/reports/page.tsx`) - CEO Only
- [ ] Redirect non-CEO users
- [ ] Performance Report section
  - [ ] Completion rate per employee
  - [ ] Overdue tasks count per employee
  - [ ] Average completion time
  - [ ] CSV export button
- [ ] Tasks Summary section
  - [ ] Total tasks by status (pie chart or table)
  - [ ] Tasks by employee
  - [ ] Overall completion rate
- [ ] Recurring Tasks section
  - [ ] List rules with spawn count
  - [ ] Completion rate per rule
  - [ ] Last spawned date
- [ ] Leaves Summary section
  - [ ] Total leave days per employee
  - [ ] Approved vs rejected counts

### Profile (`src/app/profile/page.tsx`)
- [ ] Display user full name
- [ ] Display email
- [ ] Display role name with description
- [ ] Display account status (active/inactive)
- [ ] Display user ID (short format)
- [ ] Quick action buttons
  - [ ] Go to Dashboard
  - [ ] Go to Tasks
  - [ ] Go to Leaves
  - [ ] CEO: Go to Admin Panel

## 🔌 API Routes to Create

### Tasks API (`src/app/api/tasks/route.ts`)
- [ ] POST: Create new task
- [ ] GET: List tasks with filters (status, assigned_to)
- [ ] Handle pagination

### Tasks API - Update (`src/app/api/tasks/[id]/route.ts`)
- [ ] PATCH: Update task status (record in task_history)
- [ ] GET: Get single task details

### Self Tasks API (`src/app/api/self-tasks/route.ts`)
- [ ] POST: Create self task
- [ ] GET: List self tasks with filters (user_id, date, visibility)

### Self Tasks API - Update (`src/app/api/self-tasks/[id]/route.ts`)
- [ ] PATCH: Update self task
- [ ] DELETE: Delete self task

### Leaves API (`src/app/api/leaves/route.ts`)
- [ ] POST: Create leave request
- [ ] GET: List leaves with filters (status, user_id, date range)

### Leaves API - Update (`src/app/api/leaves/[id]/route.ts`)
- [ ] PATCH: Update leave status (approve/reject)
- [ ] DELETE: Delete leave (pending only)

### Admin - Employees API (`src/app/api/admin/employees/route.ts`)
- [ ] POST: Create employee (Supabase Auth + users table)
- [ ] GET: List all employees with roles

### Admin - Employees API - Update (`src/app/api/admin/employees/[id]/route.ts`)
- [ ] PATCH: Update employee (role, is_active)
- [ ] POST: Reset password (update Supabase Auth)

### Recurring Tasks API (`src/app/api/recurring-tasks/route.ts`)
- [ ] POST: Create recurring task rule
- [ ] GET: List recurring rules

### Recurring Tasks API - Update (`src/app/api/recurring-tasks/[id]/route.ts`)
- [ ] PATCH: Toggle is_active, update rule

### Cron API (`src/app/api/cron/spawn-tasks/route.ts`)
- [ ] GET: Call spawn_recurring_tasks() Supabase function
- [ ] Verify request source (security)
- [ ] Return spawn count

## 🧩 Components to Create

### Layout Components

#### Navbar (`src/components/layout/Navbar.tsx`)
- [ ] Logo and app name
- [ ] Navigation links (Dashboard, Tasks, Self Tasks, Leaves)
- [ ] Admin link (CEO only)
- [ ] Profile link
- [ ] Logout button
- [ ] Mobile responsive hamburger menu
- [ ] Active page indicator

#### Protected Layout (`src/components/layout/ProtectedLayout.tsx`)
- [ ] Wrap pages with authentication check
- [ ] Include Navbar
- [ ] Include ToastProvider
- [ ] Footer (optional)

### Feature Components

#### TaskCard (`src/components/tasks/TaskCard.tsx`)
- [ ] Display task title, details, due date
- [ ] Status badge
- [ ] Overdue indicator
- [ ] Click to open details modal

#### TaskDetailsModal (`src/components/tasks/TaskDetailsModal.tsx`)
- [ ] Full task details
- [ ] Status history
- [ ] Assignee and creator info
- [ ] Edit status dropdown

#### AssignTaskModal (`src/components/tasks/AssignTaskModal.tsx`)
- [ ] Form for creating new task
- [ ] Employee dropdown
- [ ] Due date picker
- [ ] Submit button

#### LeaveCard (`src/components/leaves/LeaveCard.tsx`)
- [ ] Display leave period and duration
- [ ] Status badge
- [ ] Reason
- [ ] Approve/Reject buttons (CEO only)

#### EmployeeCard (`src/components/admin/EmployeeCard.tsx`)
- [ ] Employee name and email
- [ ] Role badge
- [ ] Active/Inactive toggle
- [ ] Reset password button

#### StatCard (`src/components/dashboard/StatCard.tsx`)
- [ ] Icon
- [ ] Title
- [ ] Count/Value
- [ ] Optional trend indicator

## 🧪 Testing Checklist

- [ ] Login with CEO account
- [ ] Login with employee account
- [ ] Create task as CEO
- [ ] Update task status as employee
- [ ] View task details
- [ ] Log self task
- [ ] Edit/delete own self task
- [ ] CEO views all self tasks
- [ ] Request leave as employee
- [ ] Approve leave as CEO
- [ ] Reject leave as CEO
- [ ] Edit pending leave
- [ ] Delete pending leave
- [ ] Add employee as CEO
- [ ] Deactivate employee
- [ ] Reset employee password
- [ ] Create recurring task rule
- [ ] View reports as CEO
- [ ] Export CSV report
- [ ] Test on mobile device
- [ ] Test offline functionality
- [ ] Install PWA on mobile
- [ ] Test all filters
- [ ] Test pagination
- [ ] Test logout
- [ ] Test protected routes (non-CEO accessing admin)

## 🚀 Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Fix any build errors
- [ ] Push code to GitHub
- [ ] Connect repository to Netlify
- [ ] Add environment variables in Netlify
- [ ] Deploy to Netlify
- [ ] Verify deployment URL works
- [ ] Test login on production
- [ ] Test all features on production
- [ ] Set up recurring tasks cron (Netlify function or external)
- [ ] Test recurring task spawning
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic on Netlify)
- [ ] Test PWA install from production URL
- [ ] Share with users

## 📱 Post-Launch

- [ ] Monitor Netlify analytics
- [ ] Check Supabase logs for errors
- [ ] Gather user feedback
- [ ] Add users as needed
- [ ] Monitor recurring task spawning
- [ ] Backup database regularly (Supabase provides this)
- [ ] Update documentation as needed

---

## 🎯 Current Status

**Foundation: ✅ Complete**

**Remaining Work:**
- Dashboard page
- Tasks page  
- Self Tasks page
- Leaves page
- Admin panel
- Reports page
- Profile page
- API routes for all operations
- Layout/Navigation components
- Testing
- Deployment

**Estimated Time to Complete:** 15-20 hours of focused development

---

**Good luck! Follow this checklist and you'll have a fully functional employee portal! 🚀**
