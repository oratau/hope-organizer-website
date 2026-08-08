# 🚀 HOPE Website - Vercel Deployment Guide

## ✅ Prerequisites

1. **Vercel CLI**: `npm i -g vercel`
2. **Vercel Account**: https://vercel.com/signup
3. **Git**: https://git-scm.com/downloads
4. **Resend Account**: https://resend.com (for OTP emails)

---

## 📦 Step 1: Install Dependencies

First, install the latest dependencies including Vercel Node.js runtime:

```bash
npm install
```

This will install:
- `otplib@^13.0.0` (upgraded from v12 to fix deprecation warnings)
- `@vercel/node@^3.2.28` (for serverless functions)
- All other dependencies

---

## 🔧 Step 2: Initialize Git Repository

```bash
cd c:\Users\TUFF\Documents\HopeWeb
git init
git add .
git commit -m "Initial commit - HOPE Organizer website"
```

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- What's your project's name? **hope-organizer** (or your preferred name)
- In which directory is your code located? **.** (current directory)
- Want to override the settings? **N**

For production deployment:
```bash
vercel --prod
```

Or use the automated script:
```bash
deploy.bat
```

### Option B: Using Vercel Dashboard

1. Push code to GitHub first:
   ```bash
   # Create new repository on GitHub
   # Then push:
   git remote add origin https://github.com/YOUR_USERNAME/hope-organizer.git
   git branch -M main
   git push -u origin main
   ```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
5. Click **Deploy**

---

## 🔐 Step 4: Configure Environment Variables (CRITICAL)

**Without these variables, the contact form will not work!**

### Via Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production**, **Preview**, and **Development**:

| Variable | Value | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_xxxxx...` | Get from https://resend.com/api-keys |
| `EMAIL_FROM` | `contact@yourdomain.com` | Must be verified in Resend |

### Via Vercel CLI:
```bash
vercel env add RESEND_API_KEY production
# Enter your API key when prompted

vercel env add EMAIL_FROM production
# Enter your verified email when prompted
```

### Setting Up Resend:
1. Sign up at https://resend.com
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Get API key from https://resend.com/api-keys
4. Add the API key to Vercel environment variables
5. **Important**: The `EMAIL_FROM` must be verified in Resend

### After Adding Variables:
Redeploy to apply changes:
```bash
vercel --prod
```

Or in Vercel Dashboard → Deployments → Redeploy

---

## 🏗️ Architecture Overview

### What's Deployed:

#### ✅ Static Frontend (`/dist`)
- Built with Vite + React + TypeScript
- All pages: Home, About, Vision, Mission, Structure, Business Fields
- Translations (EN/ID)
- Responsive design
- Custom 404 page

#### ✅ Serverless API Functions (`/api`)
The contact form OTP system runs on Vercel serverless functions:

| Endpoint | Function File | Purpose |
|----------|---------------|---------|
| `/api/contact/send-otp` | `api/contact-send-otp.ts` | Generate & send 6-digit OTP via email |
| `/api/contact/verify-otp` | `api/contact-verify-otp.ts` | Verify user-submitted OTP code |
| `/api/contact` | `api/contact.ts` | Final form submission after verification |

**How it works:**
1. User fills contact form (name, email, message)
2. Clicks "Send OTP" → `/api/contact/send-otp` generates code & emails it
3. User enters 6-digit code from email
4. Clicks "Verify OTP" → `/api/contact/verify-otp` validates code
5. After verification, user clicks "Submit" → `/api/contact` processes form
6. User receives confirmation email

### What's NOT Deployed:

❌ **Express Backend** (`server/index.ts`)
- Runs locally only for development
- Admin dashboard TOTP authentication
- Blog article management
- Contact submissions database

**Note**: To enable admin features, you'd need to:
- Deploy backend separately (Railway, Render, etc.)
- Or convert all backend routes to Vercel serverless functions
- Set up database (Vercel Postgres, MongoDB, etc.)

---

## 🧪 Step 5: Testing Your Deployment

After deployment, test these features:

### ✅ Homepage & Navigation
- All sections load correctly
- Smooth scrolling to sections
- All menu links work
- Logo and images display

### ✅ Language Toggle
- Switch between EN/ID
- All text updates correctly
- Check all sections in both languages

### ✅ Contact Form OTP (CRITICAL TEST)
1. Fill in name, email, and message
2. Click **"Send OTP"**
3. Check email inbox (and spam folder!) for 6-digit code
4. Enter OTP code in the 6 input boxes
5. Click **"Verify OTP"**
6. Should show green "Email verified" badge
7. Click **"Submit"**
8. Should show success message with confetti 🎉
9. Check email for confirmation message

### ✅ Responsive Design
- Test on mobile (375px - 428px width)
- Test on tablet (768px - 1024px width)
- Test on desktop (1280px+ width)
- Check all images and text scaling

### ✅ Custom 404 Page
- Visit invalid route: `https://yoursite.vercel.app/#/invalid`
- Should show custom 404 page with mascot
- "Back to Home" button should work

### ✅ Trusted By Section
- All logos display correctly
- Marquee animation scrolls smoothly
- Logos maintain proper size and spacing

---

## 🐛 Troubleshooting

### Build Fails

**Symptom**: Deployment fails during build step

**Solutions**:
1. Test build locally first:
   ```bash
   npm run build
   ```
2. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```
3. Verify all dependencies are installed:
   ```bash
   npm install
   ```
4. Check Node version (must be 18+):
   ```bash
   node --version
   ```
5. In Vercel: Settings → General → Node.js Version → Select 18.x or 20.x

### Contact Form - "Network Error"

**Symptom**: Clicking "Send OTP" shows "Network error" message

**Solutions**:
1. Check Vercel Functions logs:
   - Vercel Dashboard → Your Project → Functions
   - Look for errors in `/api/contact-send-otp`
2. Verify `vercel.json` has correct rewrites
3. Check if `/api` folder is deployed:
   - Vercel Dashboard → Deployments → Click latest → View Source
4. Test API directly in browser:
   ```
   POST https://your-site.vercel.app/api/contact/send-otp
   ```

### OTP Email Not Received

**Symptom**: "Send OTP" succeeds but no email arrives

**Solutions**:
1. **Check Environment Variables**:
   - Vercel Dashboard → Settings → Environment Variables
   - Verify `RESEND_API_KEY` exists and is correct
   - Verify `EMAIL_FROM` matches verified domain in Resend
2. **Check Resend Dashboard**:
   - Log into https://resend.com
   - Navigate to "Emails" section
   - Check for sent email and delivery status
3. **Check Spam Folder**: OTP emails might be filtered as spam
4. **Check Function Logs**:
   - Vercel Dashboard → Functions → `/api/contact-send-otp`
   - Look for email send errors
5. **Verify Domain in Resend**:
   - Resend Dashboard → Domains
   - Ensure your domain is verified (green checkmark)
6. **For Testing**: Use `onboarding@resend.dev` as `EMAIL_FROM` (Resend's test domain)

### OTP Verification Fails

**Symptom**: Entering correct OTP shows "Incorrect OTP" error

**Solutions**:
1. Ensure code is entered within **5 minutes** (expiry time)
2. Check that all 6 digits are entered correctly
3. Try resending OTP (max 3 times)
4. Clear browser cache and try again
5. Check Vercel function logs for verification errors

**Note on OTP Storage**:
- OTP codes are stored in-memory (serverless function global state)
- In rare cases, different function instances might handle send/verify
- If persistent issues occur, consider upgrading to Vercel KV (Redis)

### Images Not Loading

**Symptom**: Broken image icons or missing images

**Solutions**:
1. Verify image paths are relative to `public/` folder
   - ✅ Correct: `/assets/logo/logo-white.png`
   - ❌ Wrong: `../public/assets/logo/logo-white.png`
2. Check images exist in repository
3. Check image file extensions match exactly (case-sensitive)
4. Clear Vercel cache:
   - Settings → Clear Cache → Redeploy
5. Check deployment source to ensure images were uploaded

### 404 on Page Refresh

**Symptom**: Refreshing page shows 404 error

**Solutions**:
- This should be handled by `vercel.json` configuration
- Verify `vercel.json` has the fallback route:
  ```json
  {
    "routes": [
      { "src": "/(.*)", "dest": "/index.html" }
    ]
  }
  ```
- Redeploy after fixing

### Deprecation Warnings (otplib)

**Symptom**: Build shows warnings about `@otplib/plugin-thirty-two@12.0.1`

**Solution**: Already fixed! The package.json now uses `otplib@^13.0.0`

If you see this warning:
```bash
npm install otplib@^13.0.0 @otplib/preset-default@^13.0.0
```

---

## 🔄 Continuous Deployment

### Auto-Deploy from Git

Once connected to GitHub/GitLab/Bitbucket, Vercel automatically:
- ✅ Deploys to production on `main` branch pushes
- ✅ Creates preview deployments for pull requests
- ✅ Runs builds and tests before deployment
- ✅ Shows deployment status in Git commits

### Manual Deploy

After making changes:
```bash
git add .
git commit -m "Update: description of changes"
git push
```

Vercel auto-deploys within 1-2 minutes.

Or use CLI for immediate deploy:
```bash
vercel --prod
```

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Vercel Dashboard → Your Project → Settings → Domains
2. Click **Add Domain**
3. Enter your domain (e.g., `hopeorganizer.com`)
4. Click **Add**

### Step 2: Configure DNS

Vercel will provide DNS records. Add to your domain registrar:

**For Root Domain (hopeorganizer.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Propagation

- DNS changes can take 1-48 hours
- Check status in Vercel Dashboard
- SSL certificate auto-generates after DNS is verified

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Test contact form OTP workflow end-to-end
- [ ] Verify all images load correctly
- [ ] Test language toggle (EN/ID)
- [ ] Check responsive design on mobile
- [ ] Test custom 404 page
- [ ] Verify email confirmation arrives
- [ ] Check Vercel Analytics (if enabled)
- [ ] Set up custom domain (optional)
- [ ] Configure production `EMAIL_FROM` in Resend
- [ ] Add domain to Resend verified domains

---

## 🔒 Security Notes

### Environment Variables
- Never commit `.env` files to Git (already in `.gitignore`)
- Use Vercel Dashboard to manage environment variables
- Rotate API keys periodically

### API Rate Limiting
The serverless functions include basic rate limiting:
- Contact form: 10 seconds between submissions per IP
- OTP send: 60 seconds cooldown between resends
- OTP verify: 3 maximum resend attempts

### Email Security
- OTP codes are hashed (SHA-256) before storage
- Codes expire after 5 minutes
- Single-use only (deleted after verification)

---

## 📈 Monitoring & Analytics

### Vercel Analytics (Recommended)

1. Vercel Dashboard → Your Project → Analytics
2. Click **Enable Analytics**
3. View real-time traffic, page views, and performance

### Function Logs

Monitor serverless functions:
- Vercel Dashboard → Your Project → Functions
- Click function name to see execution logs
- Filter by status code, time range

### Error Tracking

Set up error tracking (optional):
- Integrate Sentry: https://vercel.com/integrations/sentry
- Or use Vercel's built-in error reporting

---

## 🔄 Upgrading OTP Storage (Production Recommendation)

The current OTP storage uses **in-memory global state**, which has limitations:
- Not shared between serverless function instances
- Lost on cold starts
- Not suitable for high-traffic sites

### Upgrade to Vercel KV (Redis)

For production, consider Vercel KV:

1. **Enable Vercel KV**:
   ```bash
   vercel storage create kv
   ```

2. **Install KV SDK**:
   ```bash
   npm install @vercel/kv
   ```

3. **Update serverless functions**:
   Replace `otpStore` Map with Vercel KV:
   ```typescript
   import { kv } from '@vercel/kv';
   
   // Instead of: otpStore.set(email, data)
   await kv.set(`otp:${email}`, data, { ex: 300 }); // expires in 5 min
   
   // Instead of: otpStore.get(email)
   const data = await kv.get(`otp:${email}`);
   ```

4. **Benefits**:
   - Persistent storage across function instances
   - Automatic expiration (TTL)
   - Scalable to high traffic
   - No cold start data loss

**Cost**: Free tier includes 30,000 commands/month

---

## 🆘 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Serverless Functions**: https://vercel.com/docs/functions
- **Resend Docs**: https://resend.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Contact Support**: support@vercel.com

---

## 📝 Deployment Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (Vite) | ✅ Ready | Static site with all features |
| Contact Form OTP | ✅ Ready | Serverless functions in `/api` |
| Email Delivery | ✅ Ready | Via Resend API |
| Admin Dashboard | ❌ Not Deployed | Express backend (local only) |
| Blog Management | ❌ Not Deployed | Requires backend deployment |
| Database | ❌ Not Deployed | In-memory only (not persistent) |

---

## 🎉 You're Done!

Your HOPE website is now live on Vercel with:
- ✅ Full frontend experience
- ✅ Working contact form with OTP verification
- ✅ Email delivery via Resend
- ✅ Automatic deployments from Git
- ✅ SSL certificate
- ✅ Global CDN

**Production URL**: `https://your-project-name.vercel.app`

---

**Deployment Guide Version**: 2.0  
**Last Updated**: 2026-08-08  
**Status**: Production Ready  
**Maintained by**: HOPE The Organizer Development Team
