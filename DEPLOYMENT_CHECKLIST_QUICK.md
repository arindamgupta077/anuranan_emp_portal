# ✅ Pre-Deployment Checklist

Use this checklist before deploying to Netlify:

## Code Preparation
- [ ] All changes committed and pushed to GitHub
- [ ] `npm run build` runs successfully locally
- [ ] No TypeScript errors (`npm run lint`)
- [ ] All environment variables documented in `.env.example`

## Dependencies
- [ ] `@netlify/plugin-nextjs` added to `devDependencies`
- [ ] All production dependencies in `package.json`
- [ ] `netlify.toml` configuration file present

## Supabase Setup
- [ ] Database schema applied (`schema.sql`)
- [ ] Tables created with proper RLS policies
- [ ] At least one CEO user created
- [ ] Supabase URL and keys ready

## Environment Variables Ready
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `CRON_SECRET` generated
- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NEXT_PUBLIC_APP_URL` (will be Netlify URL)

## Security
- [ ] `.env.local` in `.gitignore`
- [ ] Service role key never committed to repository
- [ ] RLS policies tested in Supabase

## Netlify Account
- [ ] Netlify account created
- [ ] GitHub connected to Netlify
- [ ] Repository access granted

---

## Quick Deploy Commands

### Install Plugin
```powershell
npm install --save-dev @netlify/plugin-nextjs
```

### Test Build
```powershell
npm run build
```

### Push to GitHub
```powershell
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Generate Cron Secret
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## After Deployment
- [ ] Site loads at Netlify URL
- [ ] Update `NEXT_PUBLIC_APP_URL` to actual Netlify URL
- [ ] Add Netlify URL to Supabase redirect URLs
- [ ] Test login functionality
- [ ] Test admin panel access
- [ ] Set up cron jobs for recurring tasks
- [ ] Test PWA installation
- [ ] Configure custom domain (optional)

---

**Ready to deploy? See `NETLIFY_DEPLOYMENT.md` for detailed steps!**
