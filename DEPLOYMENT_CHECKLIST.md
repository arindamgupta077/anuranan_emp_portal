# Deployment Checklist

Use this checklist to deploy your Anuranan Employee Portal to production.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Run `supabase/recurring-tasks-cron.sql` in SQL Editor
- [ ] Verify all 7 tables are created
- [ ] Verify RLS policies are active (green checkmarks in Table Editor)
- [ ] Get Supabase URL from Settings → API
- [ ] Get Anon key from Settings → API
- [ ] Get Service Role key from Settings → API (keep secret!)

### 2. Create First CEO User
- [ ] Go to Authentication → Users in Supabase
- [ ] Click "Add user" → "Create new user"
- [ ] Enter email and password
- [ ] Copy the user ID
- [ ] Go to Table Editor → roles table
- [ ] Find and copy the CEO role UUID
- [ ] Go to Table Editor → users table
- [ ] Click "Insert row"
- [ ] Fill in: id (user ID), full_name, email, role_id (CEO UUID), status (ACTIVE)

### 3. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Fill in `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Generate and fill in `CRON_SECRET` (see CRON_SETUP.md)

### 4. Test Locally
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Login with CEO credentials
- [ ] Test dashboard loads
- [ ] Test creating a task
- [ ] Test creating a self task
- [ ] Test requesting a leave
- [ ] Test admin panel access
- [ ] Test reports page
- [ ] Test profile page

## 🚀 Netlify Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Anuranan Employee Portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/anuranan-portal.git
git push -u origin main
```

### 2. Deploy to Netlify
- [ ] Go to [Netlify](https://app.netlify.com/)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Choose GitHub and select your repository
- [ ] Build settings should auto-detect:
  - Build command: `npm run build`
  - Publish directory: `.next`
- [ ] Click "Deploy site"

### 3. Configure Environment Variables in Netlify
- [ ] Go to Site settings → Environment variables
- [ ] Add the following variables:
  - `NEXT_PUBLIC_SUPABASE_URL` = your_supabase_url
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your_anon_key
  - `SUPABASE_SERVICE_ROLE_KEY` = your_service_role_key
  - `CRON_SECRET` = your_cron_secret
- [ ] Click "Save"
- [ ] Trigger a new deploy (Deploys → Trigger deploy → Deploy site)

### 4. Custom Domain (Optional)
- [ ] Go to Domain settings
- [ ] Click "Add custom domain"
- [ ] Follow instructions to configure DNS
- [ ] Wait for SSL certificate to provision (automatic)

### 5. Verify Deployment
- [ ] Visit your Netlify URL (e.g., https://your-site.netlify.app)
- [ ] Test login with CEO credentials
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Test on mobile device

## ⏰ Set Up Recurring Tasks Cron Job

Choose one method (see CRON_SETUP.md for details):

### Option A: External Cron Service (Easiest)
- [ ] Go to [cron-job.org](https://cron-job.org/) and create account
- [ ] Create new cron job:
  - URL: `https://your-site.netlify.app/api/cron/spawn-tasks`
  - Schedule: Daily at 1:00 AM
  - Method: GET
  - Header: `Authorization: Bearer YOUR_CRON_SECRET`
- [ ] Save and activate

### Option B: Netlify Scheduled Functions
- [ ] See CRON_SETUP.md for detailed setup
- [ ] Requires Pro plan ($19/month)

### Option C: GitHub Actions
- [ ] Create `.github/workflows/cron.yml` (see CRON_SETUP.md)
- [ ] Add `CRON_SECRET` to GitHub repository secrets
- [ ] Push to GitHub

### Test Cron Job
- [ ] Manually trigger the endpoint:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-site.netlify.app/api/cron/spawn-tasks
```
- [ ] Check response is `{"success": true}`
- [ ] Create a test recurring task in admin panel
- [ ] Verify it spawns the next day

## 🎨 PWA Icons (Optional but Recommended)

- [ ] Create `public/icon-192x192.png` (192x192 pixels)
- [ ] Create `public/icon-512x512.png` (512x512 pixels)
- [ ] Create `public/favicon.ico` (32x32 pixels)
- [ ] Use your organization's logo or a custom icon
- [ ] Redeploy to apply changes

### Quick Icon Generation
Use [Favicon Generator](https://favicon.io/) or [RealFaviconGenerator](https://realfavicongenerator.net/):
1. Upload your logo
2. Download the generated files
3. Place in `public/` folder

## 📱 Mobile App Installation

Test PWA installation:

### On Android (Chrome)
- [ ] Visit site on mobile Chrome
- [ ] Tap the "Install" banner or menu → "Install app"
- [ ] App icon appears on home screen
- [ ] Test offline functionality

### On iOS (Safari)
- [ ] Visit site on mobile Safari
- [ ] Tap Share button → "Add to Home Screen"
- [ ] App icon appears on home screen
- [ ] Test functionality

## 🧪 Production Testing

### As CEO
- [ ] Login successful
- [ ] Dashboard shows correct stats
- [ ] Can view all tasks
- [ ] Can assign tasks to employees
- [ ] Can create recurring tasks
- [ ] Can view reports page
- [ ] Can export CSV
- [ ] Can manage employees in admin panel
- [ ] Can approve/reject leaves

### As Employee
- [ ] Login successful
- [ ] Dashboard shows assigned tasks
- [ ] Can update task status
- [ ] Can log self tasks
- [ ] Can request leave
- [ ] Cannot access admin panel (redirects)
- [ ] Cannot access reports page (redirects)
- [ ] Can view own profile

### Edge Cases
- [ ] Test with no tasks
- [ ] Test with overdue tasks
- [ ] Test with pending leaves
- [ ] Test date validations
- [ ] Test form validations
- [ ] Test logout and re-login
- [ ] Test on different browsers

## 📊 Monitoring & Maintenance

### Weekly
- [ ] Check cron job execution logs
- [ ] Verify recurring tasks are spawning
- [ ] Check for error logs in Netlify
- [ ] Monitor Supabase usage (free tier limits)

### Monthly
- [ ] Review task completion rates
- [ ] Export performance reports
- [ ] Check for inactive employees
- [ ] Verify RLS policies are working

### As Needed
- [ ] Add new employees via admin panel
- [ ] Deactivate terminated employees
- [ ] Create/update recurring tasks
- [ ] Review and approve leaves

## 🔒 Security Best Practices

- [ ] Never commit `.env.local` to git (.gitignore includes it)
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- [ ] Keep `CRON_SECRET` secret
- [ ] Use strong passwords for user accounts
- [ ] Enable 2FA on Supabase account
- [ ] Enable 2FA on Netlify account
- [ ] Review Supabase logs periodically
- [ ] Keep dependencies updated (`npm audit`)

## 📞 Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Netlify Support**: https://www.netlify.com/support/
- **Documentation**: Check README.md, SETUP_INSTRUCTIONS.md, etc.

## 🎉 Post-Deployment

Congratulations! Your Anuranan Employee Portal is now live! 

### Share with Team
- [ ] Send login instructions to employees
- [ ] Share the site URL
- [ ] Provide initial credentials (change on first login)
- [ ] Share documentation links

### Training
- [ ] Walk through dashboard with team
- [ ] Demonstrate task management
- [ ] Show self-task logging
- [ ] Explain leave request process
- [ ] For CEO: Admin panel tour

### Ongoing
- [ ] Monitor usage and feedback
- [ ] Update recurring tasks as needed
- [ ] Export monthly reports
- [ ] Back up data periodically (Supabase has automatic backups)

---

## 🚨 Troubleshooting

### "Cannot connect to database"
- Check Supabase URL and keys are correct
- Verify RLS policies are enabled
- Check Supabase project status

### "Unauthorized" errors
- Verify environment variables are set in Netlify
- Check user has correct role_id in users table
- Verify RLS policies allow the operation

### Cron job not working
- Test endpoint manually with curl
- Check Authorization header matches CRON_SECRET
- Verify cron service is configured correctly
- Check Netlify function logs

### PWA not installing
- Verify manifest.json is accessible
- Check HTTPS is enabled (Netlify auto-provides)
- Ensure icons exist in public folder
- Clear browser cache and try again

---

**Need help?** Check the documentation files:
- `README.md` - Overview and installation
- `SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `CRON_SETUP.md` - Cron job configuration
- `FEATURES_COMPLETE.md` - Full feature list
- `PROJECT_STRUCTURE.md` - File organization
