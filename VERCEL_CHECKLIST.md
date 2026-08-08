# ✅ Vercel Deployment Checklist

## Sebelum Deploy

- [ ] Build berhasil lokal: `npm run build`
- [ ] Tidak ada TypeScript error: `npx tsc --noEmit`
- [ ] Test preview lokal: `npm run serve`
- [ ] Semua gambar ada di folder `public/assets/`
- [ ] File `.env` sudah di `.gitignore` (JANGAN commit API key!)

## Saat Deploy

### Via Vercel CLI:
```bash
vercel login
vercel --prod
```

### Via Vercel Dashboard:
1. Push ke GitHub
2. Import project di vercel.com/new
3. Auto-detect Vite configuration
4. Deploy

## Setelah Deploy - WAJIB!

### 1. Set Environment Variables
Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

| Variable | Value | Keterangan |
|----------|-------|------------|
| `RESEND_API_KEY` | `re_xxxxx...` | Dari resend.com/api-keys |
| `EMAIL_FROM` | `contact@domain.com` | Email terverifikasi di Resend |

**PENTING**: Tambahkan untuk **Production**, **Preview**, DAN **Development**!

### 2. Redeploy Setelah Tambah Variables
```bash
vercel --prod
```

Atau di Vercel Dashboard: Deployments → Latest → Redeploy

## Testing Setelah Deploy

### ✅ Homepage
- [ ] Navbar muncul dengan logo
- [ ] Hero section ter-load
- [ ] Gambar semua muncul (tidak broken)
- [ ] Language toggle EN/ID berfungsi

### ✅ Contact Form
- [ ] Form bisa diisi
- [ ] Klik "Send OTP" → terima email dalam 1 menit
- [ ] Cek inbox DAN spam folder
- [ ] Input 6-digit OTP
- [ ] Klik "Verify OTP" → muncul green badge
- [ ] Klik "Submit" → muncul success message + confetti
- [ ] Terima confirmation email

### ✅ Navigation
- [ ] Semua menu di navbar bisa diklik
- [ ] Smooth scroll ke section yang benar
- [ ] About Us, Vision, Mission, etc. semua load
- [ ] Trusted By section tampil dengan logo marquee

### ✅ Responsive
- [ ] Test di mobile (Chrome DevTools)
- [ ] Test di tablet
- [ ] Test di desktop
- [ ] Semua gambar scale dengan benar

### ✅ 404 Page
- [ ] Visit `https://site.vercel.app/#/invalid`
- [ ] Muncul custom 404 dengan mascot
- [ ] Button "Back to Home" berfungsi

## Troubleshooting

### Blank Putih / White Screen

**Cek di Browser Console (F12 → Console tab)**:

1. **Error: "Failed to fetch /api/articles"**
   - ✅ Sudah diperbaiki - API articles sekarang ada
   - Refresh halaman

2. **Error: "Cannot read property of undefined"**
   - Ada bug di code
   - Lihat line number di error
   - Cek file yang disebutkan

3. **404 Not Found untuk assets**
   - Assets tidak ter-deploy
   - Check: Vercel Deployment → View Source
   - Harus ada folder `assets/` dengan gambar

4. **Nothing in console, just blank**
   - JavaScript tidak ter-load
   - Check Network tab: cari file `.js` yang merah (failed)
   - Kemungkinan build issue

### OTP Email Tidak Masuk

1. **Check Vercel Function Logs**:
   - Dashboard → Functions → `/api/contact-send-otp`
   - Lihat error di logs

2. **Check Resend Dashboard**:
   - resend.com → Emails
   - Lihat status delivery

3. **Verify Environment Variables**:
   - Settings → Environment Variables
   - `RESEND_API_KEY` dan `EMAIL_FROM` harus ada

4. **Check Spam Folder!**

### Build Gagal di Vercel

**Lihat error message di Vercel deployment logs**:

Common errors:
- `Cannot find module`: Missing dependency → `npm install <package>`
- `Type error`: TypeScript error → Fix di code
- `Out of memory`: Build terlalu besar → Optimalkan imports

## Custom Domain Setup

1. Dashboard → Settings → Domains
2. Add Domain: `hopeorganizer.com`
3. Setup DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait 1-48 jam untuk propagation
5. SSL auto-generate

## Monitoring

### Vercel Analytics
- Dashboard → Analytics → Enable
- View traffic, page views, performance

### Function Logs
- Dashboard → Functions
- Click function name untuk lihat execution logs
- Filter by error status

### Error Tracking
- Integrate Sentry (optional)
- Or use Vercel's error reporting

## Maintenance

### Update Content
```bash
# Edit files
git add .
git commit -m "Update: ..."
git push
```
Vercel auto-deploy dalam 1-2 menit.

### Update Dependencies
```bash
npm update
npm audit fix
npm run build  # test
git push
```

### Rotate API Keys
1. Generate new key di Resend
2. Update di Vercel Environment Variables
3. Redeploy

## Emergency Rollback

Jika deployment baru rusak:

1. Vercel Dashboard → Deployments
2. Cari deployment terakhir yang bagus
3. Click → Promote to Production

## Support

- **Vercel Docs**: vercel.com/docs
- **Resend Docs**: resend.com/docs
- **Console Errors**: Pakai F12 di browser
- **Vercel Support**: support@vercel.com

---

**Dibuat**: 2026-08-08  
**Terakhir Update**: 2026-08-08  
**Status**: Production Ready ✅
