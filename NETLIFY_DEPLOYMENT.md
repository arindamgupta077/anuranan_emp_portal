# 🚀 Netlify Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ A Netlify account (create one at [netlify.com](https://netlify.com))
- ✅ Your Supabase project set up with the schema
- ✅ GitHub repository pushed with latest changes
- ✅ Environment variables ready

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Install Netlify Plugin** (if not done):
   ```powershell
   npm install --save-dev @netlify/plugin-nextjs
   ```

2. **Commit and Push All Changes**:
   ```powershell
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

---

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to [Netlify Dashboard](https://app.netlify.com/)**

2. **Click "Add new site" → "Import an existing project"**

3. **Connect to GitHub**:
   - Choose GitHub as your Git provider
   - Authorize Netlify to access your repositories
   - Select your repository: `anuranan_emp_portal`

4. **Configure Build Settings**:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)

5. **Add Environment Variables**:
   Click "Add environment variables" and add the following:

   ```plaintext
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   CRON_SECRET=your_random_secret_string
   NEXT_PUBLIC_APP_NAME=Anuranan Employee Portal
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```

   **Where to find Supabase credentials:**
   - Go to your [Supabase Project Dashboard](https://supabase.com/dashboard)
   - Click on your project
   - Go to **Settings** → **API**
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

   **Generate CRON_SECRET:**
   ```powershell
   # Generate a random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Click "Deploy site"**

7. **Wait for Deployment** (usually 2-5 minutes)

---

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```powershell
   netlify login
   ```

3. **Initialize Netlify**:
   ```powershell
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter site name (or leave blank for random)
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Set Environment Variables**:
   ```powershell
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_value"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_value"
   netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_value"
   netlify env:set CRON_SECRET "your_value"
   netlify env:set NEXT_PUBLIC_APP_NAME "Anuranan Employee Portal"
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-site.netlify.app"
   ```

5. **Deploy**:
   ```powershell
   netlify deploy --prod
   ```

---

### Step 3: Configure Supabase for Production

1. **Update Supabase Site URL**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Authentication** → **URL Configuration**
   - Add your Netlify URL to **Site URL**: `https://your-site-name.netlify.app`
   - Add to **Redirect URLs**: 
     - `https://your-site-name.netlify.app/**`
     - `https://your-site-name.netlify.app/login`
     - `https://your-site-name.netlify.app/dashboard`

2. **Configure CORS** (if needed):
   - Go to **Settings** → **API**
   - Add your Netlify domain to allowed origins

---

### Step 4: Set Up Cron Jobs (Recurring Tasks)

Since Netlify doesn't support traditional cron jobs, use one of these options:

#### Option A: Supabase Edge Functions (Recommended)

See `CRON_SETUP.md` for Supabase Edge Functions setup.

#### Option B: External Cron Service

1. **Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com)**

2. **Create a new cron job**:
   - URL: `https://your-site-name.netlify.app/api/cron/spawn-tasks`
   - Method: `POST`
   - Headers: 
     ```
     Authorization: Bearer your_cron_secret
     Content-Type: application/json
     ```
   - Schedule: Daily at midnight (adjust as needed)

---

### Step 5: Custom Domain (Optional)

1. **Go to Netlify Dashboard** → Your Site → **Domain settings**

2. **Click "Add custom domain"**

3. **Enter your domain** (e.g., `anuranan-portal.com`)

4. **Follow DNS instructions**:
   - Add CNAME record pointing to your Netlify site
   - Or use Netlify DNS for automatic configuration

5. **Enable HTTPS** (automatic with Let's Encrypt)

---

## 🔍 Post-Deployment Checklist

- [ ] Site loads correctly at Netlify URL
- [ ] Login works with test user
- [ ] CEO can access admin panel
- [ ] Employees can view their tasks
- [ ] Database operations work (create/read/update/delete)
- [ ] PWA features work (offline mode, install prompt)
- [ ] Environment variables are set correctly
- [ ] Supabase authentication works
- [ ] All API routes respond correctly

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Authentication Issues
- Verify Supabase URL and keys in environment variables
- Check Supabase redirect URLs configuration
- Ensure Site URL is set in Supabase

### API Routes Not Working
- Check if `@netlify/plugin-nextjs` is installed
- Verify `netlify.toml` configuration
- Check function logs in Netlify dashboard

### Database Connection Issues
- Verify Supabase credentials
- Check if database schema is properly set up
- Ensure RLS policies are correctly configured

---

## 📊 Monitoring & Analytics

### Netlify Analytics
- Enable in Netlify dashboard for visitor tracking
- View performance metrics and error logs

### Supabase Logs
- Monitor database queries in Supabase dashboard
- Check authentication logs for issues

---

## 🔄 Continuous Deployment

Once connected, Netlify will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deploying

---

## 📱 Testing Your Deployment

1. **Test the deployed site**: `https://your-site-name.netlify.app`

2. **Test login** with your CEO account

3. **Test PWA installation**:
   - Chrome: Click install icon in address bar
   - Mobile: Add to Home Screen

4. **Test offline functionality**:
   - Open DevTools → Application → Service Workers
   - Check "Offline" mode
   - Navigate through the app

---

## 🎉 You're Live!

Your Anuranan Employee Portal is now deployed and accessible worldwide! 

**Next Steps:**
- Share the URL with your team
- Create user accounts for all employees
- Set up recurring tasks
- Monitor usage and performance

**Support:**
- Netlify Support: https://answers.netlify.com/
- Supabase Support: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.local` or `.env` files to Git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Regularly rotate your `CRON_SECRET`
- Enable 2FA on Netlify and Supabase accounts
- Review Supabase RLS policies regularly
- Monitor access logs for suspicious activity

---

## 📝 Updates & Maintenance

To update your deployed site:

1. Make changes locally
2. Test thoroughly
3. Commit and push:
   ```powershell
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. Netlify auto-deploys in 2-5 minutes

---

**Deployment Date:** November 1, 2025
**Version:** 1.0.0
