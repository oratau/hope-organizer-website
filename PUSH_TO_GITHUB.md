# 📤 Cara Push Code ke GitHub

## Step-by-Step

### 1️⃣ Buat Repository di GitHub

1. Buka: https://github.com/new
2. Login dengan akun GitHub
3. Repository name: `hope-organizer-website`
4. Private atau Public: **Pilih sesuai keinginan**
5. ❌ JANGAN centang "Add README file"
6. Click **"Create repository"**

---

### 2️⃣ Copy URL Repository

Setelah repository dibuat, GitHub akan tampilkan URL seperti:
```
https://github.com/YOUR_USERNAME/hope-organizer-website.git
```

**Copy URL tersebut!** (ganti YOUR_USERNAME dengan username GitHub Anda)

---

### 3️⃣ Jalankan Commands Berikut

Buka PowerShell/Terminal di folder `HopeWeb`, lalu jalankan:

```bash
# 1. Add remote (ganti URL dengan URL repository Anda!)
git remote add origin https://github.com/YOUR_USERNAME/hope-organizer-website.git

# 2. Rename branch ke main
git branch -M main

# 3. Push code ke GitHub
git push -u origin main
```

**PENTING**: Ganti `YOUR_USERNAME` dengan username GitHub Anda!

---

### 4️⃣ Jika Diminta Login

Saat `git push`, mungkin diminta username dan password:

**Username**: GitHub username Anda

**Password**: ❌ **BUKAN password biasa!** Harus pakai **Personal Access Token**

#### Cara Buat Personal Access Token:

1. Buka: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `Vercel Deployment Token`
4. Expiration: **No expiration** (atau pilih durasi)
5. Scope: Centang **`repo`** (Full control of private repositories)
6. Click **"Generate token"** (tombol hijau di bawah)
7. **COPY TOKEN** yang muncul (hanya muncul sekali!)
8. Paste sebagai **password** saat git push

---

### 5️⃣ Setelah Push Berhasil

Anda akan lihat output seperti:
```
Enumerating objects: 75, done.
Counting objects: 100% (75/75), done.
Delta compression using up to 8 threads
Compressing objects: 100% (65/65), done.
Writing objects: 100% (75/75), 1.2 MiB | 500 KiB/s, done.
Total 75 (delta 10), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/hope-organizer-website.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **BERHASIL!** Code Anda sekarang di GitHub.

---

### 6️⃣ Verify di GitHub

Buka browser, pergi ke:
```
https://github.com/YOUR_USERNAME/hope-organizer-website
```

Anda harus lihat semua files Anda di sana!

---

## 🔄 Next: Connect Vercel ke GitHub

Setelah code di GitHub:

### Option A: Buat Project Baru di Vercel (Recommended)

1. Buka: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Pilih **`hope-organizer-website`**
4. Framework: **Vite** (auto-detect)
5. Build Command: `npm run vercel-build`
6. Output Directory: `dist`
7. Click **"Deploy"**

### Option B: Connect Project yang Sudah Ada

1. Vercel Dashboard → Project "hope-web"
2. Settings → Git
3. Click **"Connect Git Repository"**
4. Pilih `hope-organizer-website`
5. Click **"Connect"**

Vercel akan auto-deploy setelah connect!

---

## 🎉 After Deployment

1. Tunggu build selesai (1-2 menit)
2. Buka: https://hope-web-flax.vercel.app/
3. Website harus load (tidak blank!)
4. Test contact form, language toggle, dll

---

## ❗ Troubleshooting

### Error: "remote origin already exists"

Artinya remote sudah ada. Hapus dan add lagi:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/hope-organizer-website.git
git push -u origin main
```

### Error: "Permission denied"

Artinya authentication gagal. Pastikan:
1. ✅ Username benar
2. ✅ Pakai **Personal Access Token** sebagai password (bukan password biasa)

### Push Terlalu Lama / Stuck

Coba dengan SSH instead of HTTPS:
1. Setup SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. Use SSH URL: `git@github.com:YOUR_USERNAME/hope-organizer-website.git`

---

## 📚 Useful Git Commands

```bash
# Check remote URL
git remote -v

# Check branch
git branch

# Check status
git status

# View commits
git log --oneline -5

# Push updates setelah changes
git add .
git commit -m "Update: description"
git push
```

---

**Ready to push? Follow steps above!** 🚀
