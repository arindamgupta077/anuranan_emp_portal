# Testing Guide for Authentication Fix

## Pre-Deployment Testing (Local)

### 1. Build and Run Production Mode Locally

```powershell
# Clean install dependencies
npm install

# Build the project
npm run build

# Start in production mode
npm run start
```

### 2. Test Multiple User Logins

#### Test Case 1: Basic Login/Logout
1. Open browser in normal mode
2. Login with User A credentials
3. Verify dashboard shows User A's name and role
4. Check browser console for logs:
   - `Login successful, user ID: [User A ID]`
   - `Dashboard - Auth User ID: [User A ID]`
   - `Dashboard - DB User: [User A Name]`
5. Click Logout
6. Verify redirected to login page

#### Test Case 2: User Switching
1. Login with User A
2. Note the dashboard stats (tasks count, etc.)
3. Logout
4. Login with User B
5. Verify:
   - Dashboard shows User B's name (NOT User A)
   - Stats are different from User A
   - Tasks shown belong to User B only

#### Test Case 3: Multiple Browsers (Simulate Multiple Users)
1. Browser 1: Login with User A
2. Browser 2 (Incognito): Login with User B
3. Browser 3 (Different browser): Login with User C
4. Verify each browser shows correct user data
5. Check that actions in one browser don't affect others

### 3. Check Network Tab

Open browser DevTools > Network tab:

1. **Login Request**
   - Check for Set-Cookie headers
   - Verify cookies have correct attributes:
     - `SameSite=Lax`
     - `Secure` (in production)
     - `Path=/`

2. **Dashboard Request**
   - Check Response Headers:
     - `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
     - `Pragma: no-cache`
     - `Expires: 0`

3. **API Requests**
   - Verify cookies are sent with requests
   - Check for 401 errors (should not occur for logged-in users)

### 4. Check Application Tab (DevTools)

1. **Cookies**
   - Look for Supabase auth cookies
   - Verify they're set for the correct domain
   - Check expiration times

2. **Storage**
   - SessionStorage should be cleared on logout
   - LocalStorage should not contain stale auth tokens

## Post-Deployment Testing (Netlify)

### 1. Initial Deployment Checks

```powershell
# Push changes to Git
git add .
git commit -m "fix: Authentication session issues for Netlify"
git push origin main
```

Wait for Netlify to deploy (usually 2-5 minutes)

### 2. Clear Netlify Cache

1. Go to Netlify Dashboard
2. Navigate to: Site Configuration > Build & Deploy
3. Click "Clear cache and deploy site"
4. Wait for fresh deployment

### 3. Production Testing

#### Test Case 1: CEO Account (Admin Access)
1. Open Netlify URL in incognito
2. Login with CEO credentials
3. Verify:
   - ✅ Dashboard shows CEO name
   - ✅ "Admin" menu item visible
   - ✅ Can access /admin page
   - ✅ See all employees' tasks
   - ✅ Can assign tasks to others

#### Test Case 2: Regular Employee Account
1. Open Netlify URL in different browser/device
2. Login with employee credentials
3. Verify:
   - ✅ Dashboard shows employee name
   - ✅ "Admin" menu item NOT visible
   - ✅ Cannot access /admin page
   - ✅ See only own tasks
   - ✅ Cannot assign tasks to others

#### Test Case 3: Parallel Sessions
1. Device 1: Login as CEO
2. Device 2: Login as Employee A
3. Device 3: Login as Employee B
4. Verify:
   - ✅ Each device shows correct user
   - ✅ No data leakage between sessions
   - ✅ Actions don't affect other users

### 4. Check Production Console Logs

Since we added debug logging:

1. Open DevTools Console
2. Login
3. Look for these logs:
   ```
   Login successful, user ID: [uuid]
   User email: [email]
   Database user found: [name]
   ```
4. Navigate to Dashboard
5. Look for these logs:
   ```
   Dashboard - Auth User ID: [uuid]
   Dashboard - DB User: [name] Role: [role]
   ```

### 5. Test Edge Cases

#### Test Case 1: Session Expiry
1. Login and wait for session to expire (check Supabase settings)
2. Try to navigate to dashboard
3. Should redirect to login

#### Test Case 2: Concurrent Login Same User
1. Browser 1: Login with User A
2. Browser 2: Login with User A (same user)
3. Both should work independently
4. Logout from Browser 1
5. Browser 2 should still work

#### Test Case 3: Rapid User Switching
1. Login with User A
2. Immediately logout
3. Login with User B
4. Should show User B's data (not User A)

## Expected Results Checklist

### ✅ Authentication
- [ ] Users can login with their credentials
- [ ] Each user sees their own profile
- [ ] Logout clears session completely
- [ ] Cannot access protected routes without login

### ✅ User Isolation
- [ ] User A cannot see User B's data
- [ ] Role-based access control works (CEO vs Employee)
- [ ] Tasks are user-specific
- [ ] Leave requests are user-specific

### ✅ Session Management
- [ ] Sessions persist across page refreshes
- [ ] Sessions clear on logout
- [ ] No session leakage between users
- [ ] Cookies are properly set and removed

### ✅ Caching
- [ ] No cached user data served
- [ ] Fresh data on every page load
- [ ] Cache-Control headers present
- [ ] No 304 responses for authenticated pages

### ✅ Performance
- [ ] Login is reasonably fast
- [ ] Dashboard loads quickly
- [ ] No unnecessary re-authentication
- [ ] API calls are efficient

## Troubleshooting Guide

### Issue: Still seeing wrong user after login

**Check:**
1. Clear browser cache and cookies
2. Open incognito/private window
3. Check Netlify deploy logs for errors
4. Verify environment variables in Netlify

**Solution:**
```powershell
# Clear Netlify cache again
# In Netlify dashboard: Clear cache and deploy site

# Or trigger a clean deploy
git commit --allow-empty -m "trigger deploy"
git push origin main
```

### Issue: Cookies not being set

**Check:**
1. Browser DevTools > Application > Cookies
2. Network tab > Response Headers
3. Console for any errors

**Possible causes:**
- HTTPS not enabled (cookies need secure flag)
- Domain mismatch
- Browser blocking third-party cookies

### Issue: Getting 401 Unauthorized errors

**Check:**
1. Session is still valid
2. Cookies are being sent with requests
3. Supabase connection is working

**Debug:**
```typescript
// Add to any API route
console.log('Session:', session)
console.log('User:', authUser)
```

### Issue: Performance degraded

**Check:**
1. Too many no-cache headers?
2. Database queries inefficient?
3. Too many API calls?

**Monitor:**
- Netlify Analytics
- Supabase Dashboard > Logs
- Browser Performance tab

## Rollback Procedure

If critical issues occur:

1. **Immediate Rollback:**
   ```powershell
   # In Netlify dashboard:
   # Deploys > [Previous Deploy] > "Publish deploy"
   ```

2. **Code Rollback:**
   ```powershell
   git revert HEAD
   git push origin main
   ```

3. **Investigate:**
   - Check Netlify deploy logs
   - Check Supabase logs
   - Review browser console errors
   - Test locally again

## Success Criteria

The fix is successful if:

1. ✅ Each user can login with their credentials
2. ✅ Each user sees ONLY their own data
3. ✅ CEO sees admin features, employees don't
4. ✅ No cross-user data leakage
5. ✅ Sessions work reliably
6. ✅ Logout works correctly
7. ✅ Performance is acceptable
8. ✅ No console errors

## Contact Information

If issues persist after thorough testing:

1. Check `AUTH_SESSION_FIX.md` for detailed fix information
2. Review Supabase documentation on SSR
3. Check Netlify documentation on Next.js authentication
4. Review Next.js documentation on cookies and sessions

---

**Test Date:** _________________
**Tested By:** _________________
**Results:** ⬜ Pass  ⬜ Fail
**Notes:** _________________
