# Project Structure

```
anuranan_emp_portal/
├── 📄 Configuration Files
│   ├── .env.example                    # Environment variable template
│   ├── .gitignore                      # Git ignore patterns
│   ├── next.config.js                  # Next.js configuration
│   ├── tailwind.config.js              # Tailwind CSS customization
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── package.json                    # Dependencies and scripts
│   ├── netlify.toml                    # Netlify deployment config
│   └── setup.ps1                       # PowerShell setup script
│
├── 📚 Documentation
│   ├── README.md                       # Main project documentation
│   ├── START_HERE.md                   # Quick start guide
│   ├── SETUP_INSTRUCTIONS.md           # Detailed setup guide
│   ├── CHECKLIST.md                    # Implementation checklist
│   ├── CRON_SETUP.md                   # Recurring tasks automation
│   └── FEATURES_COMPLETE.md            # Feature completion summary
│
├── 🗄️ supabase/
│   ├── README.md                       # Database setup instructions
│   ├── schema.sql                      # Main database schema (7 tables)
│   └── recurring-tasks-cron.sql        # Recurring task spawn function
│
├── 🌐 public/
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Service worker
│   └── (icon files to be added)       # PWA icons
│
├── 📱 src/
│   ├── 🎨 app/                         # Next.js 14 App Router
│   │   ├── layout.tsx                  # Root layout (font, HTML)
│   │   ├── page.tsx                    # Home page (redirects)
│   │   ├── globals.css                 # Global styles
│   │   │
│   │   ├── 🔐 login/
│   │   │   └── page.tsx                # Login page
│   │   │
│   │   ├── 📊 dashboard/
│   │   │   ├── page.tsx                # Dashboard server component
│   │   │   └── DashboardClient.tsx     # Dashboard client component
│   │   │
│   │   ├── ✅ tasks/
│   │   │   ├── page.tsx                # Tasks server component
│   │   │   └── TasksClient.tsx         # Tasks client component (full CRUD)
│   │   │
│   │   ├── 📝 self-tasks/
│   │   │   ├── page.tsx                # Self tasks server component
│   │   │   └── SelfTasksClient.tsx     # Self tasks client component
│   │   │
│   │   ├── 🌴 leaves/
│   │   │   ├── page.tsx                # Leaves server component
│   │   │   └── LeavesClient.tsx        # Leaves client component
│   │   │
│   │   ├── ⚙️ admin/
│   │   │   ├── page.tsx                # Admin panel server component (CEO only)
│   │   │   └── AdminClient.tsx         # Admin panel client (4 tabs)
│   │   │
│   │   ├── 📈 reports/
│   │   │   ├── page.tsx                # Reports server component (CEO only)
│   │   │   └── ReportsClient.tsx       # Reports client (analytics, CSV export)
│   │   │
│   │   ├── 👤 profile/
│   │   │   ├── page.tsx                # Profile server component
│   │   │   └── ProfileClient.tsx       # Profile client component
│   │   │
│   │   ├── 📵 offline/
│   │   │   └── page.tsx                # Offline fallback page (PWA)
│   │   │
│   │   └── 🔌 api/                     # API Routes
│   │       ├── tasks/
│   │       │   ├── route.ts            # POST (create), GET (list)
│   │       │   └── [id]/route.ts       # PATCH (update status)
│   │       ├── self-tasks/
│   │       │   ├── route.ts            # POST (create)
│   │       │   └── [id]/route.ts       # PATCH (update), DELETE
│   │       ├── leaves/
│   │       │   ├── route.ts            # POST (create)
│   │       │   └── [id]/route.ts       # PATCH (approve/reject), DELETE
│   │       ├── admin/
│   │       │   └── employees/
│   │       │       ├── route.ts        # POST (create with Auth)
│   │       │       └── [id]/route.ts   # PATCH (update status)
│   │       ├── recurring-tasks/
│   │       │   └── route.ts            # POST (create), PATCH (toggle)
│   │       └── cron/
│   │           └── spawn-tasks/
│   │               └── route.ts        # GET (spawn recurring tasks)
│   │
│   ├── 🧩 components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Navigation bar (role-based menu)
│   │   │   └── ProtectedLayout.tsx     # Layout wrapper with navbar
│   │   │
│   │   └── ui/                         # Reusable UI Components
│   │       ├── Button.tsx              # Button (4 variants, 3 sizes)
│   │       ├── Input.tsx               # Input with label & validation
│   │       ├── Textarea.tsx            # Textarea with label
│   │       ├── Select.tsx              # Dropdown select
│   │       ├── Modal.tsx               # Modal dialog (4 sizes)
│   │       ├── Badge.tsx               # Status badge
│   │       ├── Card.tsx                # Card container
│   │       └── Toast.tsx               # Toast notification system
│   │
│   ├── 📚 lib/
│   │   ├── types.ts                    # TypeScript type definitions
│   │   ├── database.types.ts           # Generated database types
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   └── server.ts               # Server-side Supabase client
│   │   │
│   │   └── utils/
│   │       ├── date.ts                 # Date formatting & validation
│   │       └── helpers.ts              # Helper utilities (cn, truncate, etc.)
│   │
│   └── middleware.ts                   # Auth middleware (route protection)
│
└── 🎯 TOTAL: 60+ Files Created
```

## 📊 File Count by Category

| Category | Count | Status |
|----------|-------|--------|
| **Pages** | 8 | ✅ Complete |
| **Client Components** | 7 | ✅ Complete |
| **API Routes** | 9 | ✅ Complete |
| **UI Components** | 8 | ✅ Complete |
| **Layout Components** | 2 | ✅ Complete |
| **Utilities** | 4 | ✅ Complete |
| **Configuration** | 7 | ✅ Complete |
| **Documentation** | 6 | ✅ Complete |
| **Database Scripts** | 3 | ✅ Complete |
| **PWA Files** | 2 | ✅ Complete |

## 🎨 Component Library

### UI Components
- **Button**: 4 variants (primary, secondary, danger, ghost), 3 sizes, loading state
- **Input**: Labels, error messages, help text, required indicators
- **Textarea**: Same features as Input with rows customization
- **Select**: Dropdown with options array, validation
- **Modal**: Overlay dialog with 4 sizes (sm, md, lg, xl)
- **Badge**: Status indicators for 8 different states
- **Card**: Container with optional title and action slot
- **Toast**: Global notification system with 4 types, auto-dismiss

### Layout Components
- **Navbar**: Role-based menu, mobile hamburger, user profile, logout
- **ProtectedLayout**: Wraps pages with Navbar, ToastProvider, footer

## 🗄️ Database Schema

### Tables (7 Total)
1. **roles** - 5 predefined roles
2. **users** - User profiles linked to Supabase Auth
3. **tasks** - Main tasks with auto-increment task_number
4. **task_history** - Automatic tracking via trigger
5. **self_tasks** - Employee activity logging
6. **leaves** - Leave requests with approval workflow
7. **recurring_tasks** - Rules for automated task generation

### Key Features
- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic triggers (task history)
- ✅ Helper functions (7 total)
- ✅ Proper indexes for performance
- ✅ Foreign key constraints
- ✅ Check constraints for data integrity

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | Supabase Auth with email/password |
| **Session Management** | Middleware-based route protection |
| **Authorization** | Row Level Security in database |
| **Role-Based Access** | CEO vs Employee permissions |
| **API Security** | Session verification on all routes |
| **Cron Security** | Secret token for automated tasks |
| **Admin Operations** | Service role key for user creation |

## 📱 Pages & Routes

### Public Routes
- `/login` - Authentication page

### Protected Routes (All Users)
- `/dashboard` - Role-specific stats dashboard
- `/tasks` - View and manage assigned tasks
- `/self-tasks` - Log daily activities
- `/leaves` - Request and view leaves
- `/profile` - User profile and statistics
- `/offline` - PWA offline fallback

### CEO-Only Routes
- `/admin` - Admin panel with 4 tabs
- `/reports` - Analytics and CSV export

## 🚀 API Endpoints

### Authentication
- Handled by Supabase Auth (automatic)

### Tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/[id]` - Update task status

### Self Tasks
- `POST /api/self-tasks` - Create self task
- `PATCH /api/self-tasks/[id]` - Update self task
- `DELETE /api/self-tasks/[id]` - Delete self task

### Leaves
- `POST /api/leaves` - Request leave
- `PATCH /api/leaves/[id]` - Approve/reject/update leave
- `DELETE /api/leaves/[id]` - Delete pending leave

### Admin (CEO Only)
- `POST /api/admin/employees` - Create employee with Auth
- `PATCH /api/admin/employees/[id]` - Update employee status

### Recurring Tasks (CEO Only)
- `POST /api/recurring-tasks` - Create recurring rule
- `PATCH /api/recurring-tasks` - Toggle active status

### Cron (Internal)
- `GET /api/cron/spawn-tasks` - Spawn tasks from rules

## 🎯 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js | 14.1.0 |
| **Language** | TypeScript | 5.3.3 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Auth** | Supabase Auth | Latest |
| **Icons** | Lucide React | 0.323.0 |
| **Date Utils** | date-fns | 3.3.1 |
| **Deployment** | Netlify | Latest |

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "2.39.3",
    "@supabase/ssr": "0.1.0",
    "next": "14.1.0",
    "react": "18.2.0",
    "typescript": "5.3.3",
    "tailwindcss": "3.4.1",
    "date-fns": "3.3.1",
    "lucide-react": "0.323.0",
    "clsx": "2.1.0"
  }
}
```

## ✨ Highlights

- **Type Safety**: Full TypeScript coverage including database types
- **Server Components**: Efficient data fetching with Next.js 14 App Router
- **Client Components**: Interactive UI with React hooks
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loaders and loading indicators
- **Offline Support**: PWA with service worker and offline page
- **Performance**: Optimized queries and efficient rendering
- **Security**: RLS, role checks, and secure authentication

## 🎓 Code Quality

- ✅ Consistent code style
- ✅ Proper TypeScript types
- ✅ Component reusability
- ✅ Separation of concerns
- ✅ Error handling
- ✅ Loading states
- ✅ User feedback (toasts)
- ✅ Responsive design
- ✅ Accessibility features
- ✅ Code comments where needed
