# 🚀 Deploy ke Vercel via Dashboard (Tanpa CLI)

Karena ada masalah SSL certificate dengan Vercel CLI, kita akan deploy via Vercel Dashboard menggunakan GitHub.

## 📋 Step-by-Step Guide

### Step 1: Push ke GitHub

Anda sudah punya Git repository lokal dengan semua file sudah di-commit. Sekarang tinggal push ke GitHub.

#### 1.1. Buat Repository Baru di GitHub

1. Buka https://github.com/new
2. Isi informasi repository:
   - **Repository name**: `hope-organizer-website` (atau nama lain)
   - **Description**: `Official website for HOPE The Organizer`
   - **Visibility**: Private (atau Public sesuai kebutuhan)
   - ❌ **JANGAN** centang "Initialize this repository with README" (karena sudah ada README lokal)
3. Click **Create repository**

#### 1.2. Push Code ke GitHub

Setelah repository dibuat, GitHub akan menampilkan instruksi. Copy command yang mirip seperti ini:

```bash
git remote add origin https://github.com/USERNAME/hope-organizer-website.git
git branch -M main
git push -u origin main
```

Jalankan di terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Ganti `YOUR_USERNAME` dan `YOUR_REPO_NAME` dengan milik Anda!**

Jika diminta login:
- Username: GitHub username Anda
- Password: **GitHub Personal Access Token** (BUKAN password biasa)
  - Buat token di: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Centang "repo" scope
  - Copy token dan simpan (hanya muncul sekali!)
  - Paste sebagai password

---

### Step 2: Import ke Vercel

#### 2.1. Login ke Vercel

1. Buka https://vercel.com
2. Click **Sign Up** atau **Login**
3. Pilih **Continue with GitHub**
4. Authorize Vercel untuk akses GitHub

#### 2.2. Import Project

1. Di Vercel Dashboard, click **Add New...** → **Project**
2. Atau langsung ke: https://vercel.com/new
3. Di bagian "Import Git Repository":
   - Jika tidak melihat repository, click **Adjust GitHub App Permissions**
   - Pilih repository `hope-organizer-website`
   - Click **Import**

#### 2.3. Configure Project

Vercel akan auto-detect Vite configuration. Pastikan settings berikut:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` (default) |
| **Build Command** | `npm run vercel-build` ← **PENTING!** |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**PENTING**: Ubah "Build Command" dari `npm run build` menjadi `npm run vercel-build`

#### 2.4. Environment Variables (SKIP DULU)

**Jangan** add environment variables sekarang. Kita akan add setelah deployment pertama berhasil.

Click **Deploy** →

---

### Step 3: Tunggu Deployment

Vercel akan:
1. ✅ Clone repository
2. ✅ Install dependencies (~1 menit)
3. ✅ Build project (~30 detik)
4. ✅ Deploy to CDN

Total waktu: **2-3 menit**

Anda bisa lihat real-time logs di halaman deployment.

**Jika build gagal**, lihat error di logs. Common issues:
- TypeScript error → Harus fix di code
- Missing dependency → Add ke `package.json`

---

### Step 4: Set Environment Variables (WAJIB!)

Setelah deployment berhasil, **WAJIB** set environment variables agar contact form berfungsi.

#### 4.1. Buka Project Settings

1. Di Vercel Dashboard, click project name
2. Click tab **Settings**
3. Di sidebar, click **Environment Variables**

#### 4.2. Add Variables

Add 2 variables berikut untuk **Production**, **Preview**, DAN **Development**:

**Variable 1: RESEND_API_KEY**
1. Click **Add New**
2. Name: `RESEND_API_KEY`
3. Value: (paste API key dari Resend.com)
4. Environments: Centang **Production**, **Preview**, **Development**
5. Click **Save**

**Variable 2: EMAIL_FROM**
1. Click **Add New**
2. Name: `EMAIL_FROM`
3. Value: `contact@hopeorganizer.com` (atau email terverifikasi Anda)
4. Environments: Centang **Production**, **Preview**, **Development**
5. Click **Save**

#### 4.3. Cara Dapatkan RESEND_API_KEY

1. Sign up di https://resend.com
2. Login → Dashboard
3. Navigate to: **API Keys** (sidebar)
4. Click **Create API Key**
   - Name: `HOPE Website Production`
   - Permission: **Full Access**
5. Click **Create**
6. **COPY** API key (hanya muncul sekali!)
7. Paste ke Vercel environment variable

#### 4.4. Setup EMAIL_FROM

Email yang digunakan **HARUS** verified di Resend:

**Option A: Gunakan Test Domain (untuk testing)**
```
EMAIL_FROM=onboarding@resend.dev
```
Langsung bisa dipakai tanpa verifikasi.

**Option B: Gunakan Domain Sendiri (untuk production)**
1. Resend Dashboard → **Domains**
2. Click **Add Domain**
3. Masukkan domain: `hopeorganizer.com`
4. Add DNS records yang diberikan ke domain registrar Anda:
   ```
   Type: TXT
   Name: @
   Value: (copy dari Resend)
   ```
5. Tunggu verifikasi (1-48 jam)
6. Setelah verified (green checkmark), gunakan:
   ```
   EMAIL_FROM=contact@hopeorganizer.com
   ```

---

### Step 5: Redeploy

Setelah add environment variables, **WAJIB REDEPLOY**:

1. Go to **Deployments** tab
2. Click **...** (three dots) pada deployment terbaru
3. Click **Redeploy**
4. Confirm **Redeploy**

Tunggu 1-2 menit hingga selesai.

---

### Step 6: Test Website ✅

#### 6.1. Buka Website

Vercel akan memberikan URL seperti:
```
https://hope-organizer-website.vercel.app
```

Atau dengan format:
```
https://your-project-name-username.vercel.app
```

#### 6.2. Test Checklist

**Homepage:**
- ✅ Navbar muncul dengan logo
- ✅ Hero section tampil
- ✅ Tidak ada broken image (gambar semua muncul)
- ✅ Trusted By logos muncul dan bergerak (marquee)
- ✅ 3 artikel tampil di Latest Articles section
- ✅ Contact form muncul

**Browser Console (F12 → Console):**
- ✅ Harus lihat: `"HOPE Website - Initializing React App..."`
- ✅ Harus lihat: `"React app rendered successfully."`
- ❌ TIDAK ada error merah

**Language Toggle:**
- ✅ Click EN/ID di navbar
- ✅ Semua text berubah bahasa

**Contact Form (CRITICAL):**
1. ✅ Isi form (name, email, message)
2. ✅ Click "Send OTP"
3. ✅ Check email (inbox DAN spam folder!)
4. ✅ Harus terima email dengan 6-digit code dalam 1 menit
5. ✅ Masukkan code
6. ✅ Click "Verify OTP" → green badge muncul
7. ✅ Click "Submit" → success message + confetti 🎉
8. ✅ Terima confirmation email

**Navigation:**
- ✅ Test semua menu: About Us, Vision, Mission, etc.
- ✅ Smooth scroll bekerja
- ✅ 404 page: visit `/#/invalid` → custom 404 muncul

**Mobile Test:**
- ✅ Buka di mobile browser atau Chrome DevTools (F12 → Toggle device toolbar)
- ✅ Responsive design bekerja

---

### Step 7: Custom Domain (Optional)

Jika ingin pakai domain sendiri (contoh: `hopeorganizer.com`):

#### 7.1. Add Domain di Vercel

1. Project Settings → **Domains**
2. Click **Add**
3. Enter domain: `hopeorganizer.com`
4. Click **Add**

#### 7.2. Configure DNS

Vercel akan memberikan DNS records. Add ke domain registrar Anda:

**For Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 7.3. Wait for Propagation

- DNS changes: 1-48 jam
- SSL certificate: Auto-generate after DNS verified
- Check status di Vercel Domains page

---

## 🐛 Troubleshooting

### Blank White Screen

**Check Browser Console (F12):**

1. **Error: "Failed to fetch /api/articles"**
   - API endpoint mungkin belum deploy
   - Refresh dengan Ctrl+F5
   - Check Vercel Functions logs

2. **Error: "Uncaught SyntaxError" atau JavaScript error**
   - Ada bug di code
   - Check error line number
   - Deploy ulang setelah fix

3. **No error, just blank**
   - Check Network tab (F12 → Network)
   - Lihat file `.js` yang failed (merah)

**Check Vercel Function Logs:**
1. Dashboard → **Functions** tab
2. Click `/api/articles`
3. Lihat execution logs

**Test API Directly:**
```
https://your-site.vercel.app/api/articles
```
Harus return JSON dengan array articles.

### OTP Email Tidak Masuk

**Check Environment Variables:**
1. Settings → Environment Variables
2. Pastikan `RESEND_API_KEY` dan `EMAIL_FROM` ada
3. Jika tidak ada, add dan redeploy

**Check Resend Dashboard:**
1. Login ke resend.com
2. Navigate to **Emails**
3. Lihat sent emails dan delivery status
4. Jika "failed", klik untuk lihat error

**Check Spam Folder!**

**Check Vercel Logs:**
1. Functions → `/api/contact-send-otp`
2. Lihat error messages

**Common Issue - Domain Not Verified:**
```
Error: Email must be from verified domain
```
Solution: 
- Gunakan `onboarding@resend.dev` untuk testing
- Atau verify domain di Resend

### Build Failed

**TypeScript Error:**
```bash
# Test build locally first
npm run build
```
Fix error yang muncul, commit, push.

**Out of Memory:**
Build terlalu besar. Check:
- Apakah ada file besar di repository?
- Apakah `node_modules` ikut ter-commit? (harusnya tidak)

**Missing Dependency:**
```
Cannot find module '@vercel/node'
```
Solution: Sudah di-install, push ulang.

---

## 🔄 Update Website Setelah Deploy

Setelah deployment pertama, update website sangat mudah:

### Via Git:

```bash
# Make changes to files
git add .
git commit -m "Update: deskripsi perubahan"
git push
```

Vercel akan **auto-deploy** dalam 1-2 menit setiap kali ada push ke `main` branch!

### View Deployment Status:

1. Vercel Dashboard → **Deployments** tab
2. Lihat status real-time
3. Click deployment untuk lihat logs

---

## 📊 Monitoring

### Analytics

Enable Vercel Analytics:
1. Dashboard → **Analytics** tab
2. Click **Enable**
3. View traffic, page views, performance metrics

### Function Logs

Monitor serverless functions:
1. Dashboard → **Functions** tab
2. Click function name
3. View execution logs, errors, execution time

### Alerts

Setup alerts untuk downtime:
1. Settings → **Notifications**
2. Connect Slack/Discord/Email
3. Get notified on deployment failures

---

## ✅ Checklist Lengkap

- [ ] Push code ke GitHub
- [ ] Import project ke Vercel
- [ ] Deployment berhasil (tidak error)
- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Set `EMAIL_FROM` environment variable  
- [ ] Redeploy setelah set variables
- [ ] Test homepage (tidak blank)
- [ ] Test browser console (no errors)
- [ ] Test contact form OTP end-to-end
- [ ] Test language toggle
- [ ] Test di mobile
- [ ] Test 404 page
- [ ] (Optional) Setup custom domain
- [ ] (Optional) Enable analytics

---

## 🎉 Selesai!

Website Anda sekarang live di Vercel dengan:
- ✅ Full frontend features
- ✅ Contact form dengan OTP verification
- ✅ Email delivery via Resend
- ✅ Automatic deployments dari Git
- ✅ SSL certificate (HTTPS)
- ✅ Global CDN

**Deployment URL**: https://your-project-name.vercel.app

---

## 📞 Need Help?

Jika masih ada masalah:

1. **Screenshot** browser console errors (F12 → Console)
2. **Screenshot** Vercel function logs
3. **Share** deployment URL
4. **Check** FIXED_ISSUES.md untuk common problems

---

**Created**: 2026-08-08  
**Status**: ✅ Production Ready  
**Method**: Dashboard Deploy (No CLI needed)
