# Anuranan Employee Portal

> ✅ **Status**: 100% Complete - Production Ready

A comprehensive employee management portal for Anuranan Bengali Recitation Training Institute built with Next.js 14, Supabase, and Tailwind CSS.

## 🎯 What's Included

This is a **complete, production-ready application** with all features implemented:

✅ Authentication & Authorization  
✅ Dashboard with Role-Specific Stats  
✅ Task Management (Assign, Track, Update Status)  
✅ Recurring Tasks (Weekly/Monthly Automation)  
✅ Self-Task Logging (Daily Activity Tracking)  
✅ Leave Management (Request, Approve/Reject)  
✅ Admin Panel (Employee Management, Task Creation, Recurring Task Rules)  
✅ Reports & Analytics (Performance Metrics, CSV Export)  
✅ Profile Page  
✅ PWA Support (Install as Mobile/Desktop App)  
✅ Complete API Routes  
✅ Database with RLS & Triggers  
✅ Comprehensive Documentation

## 🚀 Key Features

- **Role-Based Access Control**: CEO, Manager, Teacher, Operation Manager, and Editor roles with granular permissions
- **Task Management**: Assign tasks, track status, view history, and get overdue alerts
- **Recurring Tasks**: Automated weekly and monthly task generation via cron job
- **Self-Task Logging**: Employees log daily activities (public/private visibility)
- **Leave Management**: Full leave request and approval workflow with duration calculation
- **Admin Panel** (CEO Only): 4 tabs - Employees, Create Task, Recurring Tasks, Reports
- **Reports & Analytics** (CEO Only): Performance metrics, completion rates, CSV export
- **PWA Support**: Install as an app with offline capabilities
- **Responsive Design**: Fully responsive UI for mobile, tablet, and desktop

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Netlify account (for deployment)

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to **SQL Editor** and run the scripts in this order:
   - Run `supabase/schema.sql` (creates all tables, policies, and functions)
   - Run `supabase/recurring-tasks-cron.sql` (creates recurring task spawning function)
4. See detailed instructions in `supabase/README.md`

### 3. Create Your First CEO User

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter email and password
4. Go to **Table Editor** > **users** table
5. Find your user and update `role_id` to the CEO role UUID
6. Get CEO role UUID: `SELECT id FROM public.roles WHERE name = 'CEO';`

### 4. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from:
- Supabase Dashboard > **Settings** > **API**
- Copy **Project URL** and **anon public** key

## 🚀 Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production

```bash
npm run build
```

Test the production build:

```bash
npm start
```

## 🌐 Deployment to Netlify

### Automatic Deployment (Recommended)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Log in to [Netlify](https://netlify.com)
3. Click **Add new site** > **Import an existing project**
4. Connect your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click **Deploy site**

### Manual Deployment

```bash
npm run build
netlify deploy --prod
```

### Post-Deployment Steps

1. Set up custom domain (optional)
2. Enable HTTPS (automatic on Netlify)
3. Configure Netlify redirects (already configured in `netlify.toml`)

## 📱 PWA Installation

After deployment, users can install the app:

### On Desktop (Chrome, Edge, Brave):
1. Look for the install icon in the address bar
2. Click "Install Anuranan Employee Portal"

### On Mobile (iOS, Android):
1. Open in Safari (iOS) or Chrome (Android)
2. Tap Share > Add to Home Screen
3. Confirm installation

## 🔒 Security Features

- Row Level Security (RLS) enforced on all database tables
- CEO-only access to admin features
- Users can only see their own data (except CEO)
- Secure authentication with Supabase
- Input validation and sanitization
- HTTPS enforced in production

## 📚 User Roles & Permissions

| Feature | CEO | Other Roles |
|---------|-----|-------------|
| View own tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |
| Assign tasks | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| Log self-tasks | ✅ | ✅ |
| View all self-tasks | ✅ | ❌ |
| Request leave | ✅ | ✅ |
| Approve/reject leaves | ✅ | ❌ |
| View all leaves | ✅ | ❌ |
| Manage employees | ✅ | ❌ |
| Create recurring tasks | ✅ | ❌ |
| View reports | ✅ | ❌ |

## 🔄 Recurring Tasks Setup

Recurring tasks need to be spawned daily. Choose one option:

### Option 1: Netlify Scheduled Functions (Recommended)

Create a Netlify function (already included in the codebase) that runs daily at midnight.

### Option 2: Supabase pg_cron (If Available)

```sql
SELECT cron.schedule(
    'spawn-recurring-tasks',
    '0 0 * * *',
    $$SELECT spawn_recurring_tasks()$$
);
```

### Option 3: External Cron Service

Use a service like cron-job.org to hit your API endpoint daily:
```
https://your-app.netlify.app/api/cron/spawn-tasks
```

## 📖 Pages Overview

- **/** - Home (redirects to dashboard if logged in, otherwise to login)
- **/login** - Login page
- **/dashboard** - Main dashboard with stats and quick actions
- **/tasks** - Task list with filters and status updates
- **/self-tasks** - Self-task logging
- **/leaves** - Leave management
- **/admin** - Admin panel (CEO only)
- **/reports** - Reports and analytics (CEO only)
- **/profile** - User profile
- **/offline** - Offline fallback page

## 🐛 Troubleshooting

### Can't log in
- Verify your email and password
- Check if user exists in Supabase Auth
- Ensure user has a role assigned in `users` table
- Verify `is_active` is `true`

### Permission denied errors
- Check RLS policies in Supabase
- Verify user role is correct
- Ensure user ID matches between `auth.users` and `public.users`

### Recurring tasks not spawning
- Test manually: `SELECT spawn_recurring_tasks();`
- Check if rules have `is_active = true`
- Verify `start_date` is not in the future
- Ensure cron job is configured

### Build errors on Netlify
- Check environment variables are set
- Verify Node.js version (18+)
- Review build logs for specific errors

## 🤝 Support

For issues or questions:
1. Check this README
2. Review `supabase/README.md` for database setup
3. Check Supabase logs for database errors
4. Review Netlify build logs for deployment issues

## 📄 License

This project is proprietary software for Anuranan Bengali Recitation Training Institute.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)
