# 🌟 HOPE The Organizer - Official Website

Professional event management company website featuring modern design, multi-language support, and advanced contact form with OTP verification.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Admin Setup**: http://localhost:3001/api/admin/setup-totp

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run serve
```

---

## 📋 Features

### ✅ Implemented Features

- **Multi-language Support**: English (EN) and Indonesian (ID)
- **Responsive Design**: Mobile-first, optimized for all screen sizes
- **Smooth Scrolling**: Animated navigation with GSAP
- **Contact Form with OTP Verification**:
  - Email-based OTP authentication
  - 6-digit code with 5-minute expiry
  - Resend functionality (max 3 attempts)
  - Rate limiting and spam protection
- **Custom 404 Page**: Branded not-found page with mascot
- **Trusted By Section**: Animated logo marquee with 21 partner logos
- **Business Sections**: About, Vision, Mission, Structure, Business Fields
- **Blog System**: Latest articles with modal detail view
- **Admin Dashboard**: TOTP-based authentication (local development only)

### 🎨 Design Highlights

- **Color Scheme**: Navy blue (#192b58) and Gold (#ffcb04)
- **Typography**: Serif fonts (Masvis, Argent CF) for elegance
- **Animations**: Smooth transitions, hover effects, confetti celebrations
- **Patterns**: Watermark backgrounds for depth
- **Logo Display**: Smart sizing and filtering for consistent branding

---

## 📁 Project Structure

```
HopeWeb/
├── api/                          # Vercel serverless functions
│   ├── contact-send-otp.ts       # OTP generation & email
│   ├── contact-verify-otp.ts     # OTP verification
│   └── contact.ts                # Final form submission
├── public/
│   ├── assets/
│   │   ├── 404/                  # 404 page mascot
│   │   ├── hero/                 # Hero section images
│   │   ├── logo/                 # Brand logos (black/white)
│   │   ├── patterns/             # Background patterns
│   │   └── trusted-by/           # Partner logos (21 files)
│   └── fonts/                    # Custom fonts
├── server/
│   ├── index.ts                  # Express backend (dev only)
│   └── database.json             # Local data storage
├── src/
│   ├── components/               # React components
│   │   ├── Navbar.tsx            # Navigation with language toggle
│   │   ├── HeroSection.tsx       # Homepage hero
│   │   ├── TrustedBy.tsx         # Animated logo marquee
│   │   ├── ContactSection.tsx    # OTP-verified contact form
│   │   ├── LatestArticles.tsx    # Blog articles grid
│   │   ├── NotFound.tsx          # Custom 404 page
│   │   ├── AdminDashboard.tsx    # Admin panel (dev only)
│   │   └── ...                   # Other components
│   ├── i18n.ts                   # Translation definitions
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables (DO NOT COMMIT)
├── vercel.json                   # Vercel deployment config
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── DEPLOYMENT_GUIDE.md           # Detailed deployment instructions
└── README.md                     # This file
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 6.1
- **Styling**: Tailwind CSS 3.4
- **Animations**: GSAP 3.15
- **Icons**: Lucide React
- **Effects**: canvas-confetti

### Backend (Development)
- **Runtime**: Node.js 18+
- **Framework**: Express 4.21
- **Authentication**: TOTP (otplib) + JWT
- **Email**: Resend API
- **Database**: JSON file (development only)

### Deployment
- **Platform**: Vercel
- **Serverless Functions**: Vercel Node.js runtime
- **Environment**: Node.js 18+

---

## 🔐 Environment Variables

Create a `.env` file in the root directory (already in `.gitignore`):

```env
# Email Configuration (Required for Contact Form)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=no-reply@hopeorganizer.com

# Server Configuration (Development Only)
PORT=3001
```

### Getting Environment Variables:

1. **RESEND_API_KEY**: 
   - Sign up at https://resend.com
   - Verify your domain or use test domain
   - Get API key from dashboard

2. **EMAIL_FROM**:
   - Must be verified in Resend dashboard
   - For testing: `onboarding@resend.dev`
   - For production: `contact@yourdomain.com`

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

Or use the automated script:
```bash
deploy.bat
```

**Important**: After deployment, add environment variables in Vercel Dashboard:
- Settings → Environment Variables → Add `RESEND_API_KEY` and `EMAIL_FROM`

---

## 📖 Usage

### Language Switching

The website supports English and Indonesian:
- Click **EN/ID** toggle in navbar
- All content updates in real-time
- State persists during session

### Contact Form

1. User fills form (name, email, message)
2. Clicks "Send OTP"
3. Receives 6-digit code via email
4. Enters code (expires in 5 minutes)
5. Clicks "Verify OTP"
6. After verification, clicks "Submit"
7. Receives confirmation email

**Rate Limiting**:
- 60-second cooldown between OTP resends
- Maximum 3 resend attempts
- 10-second cooldown between form submissions

### Admin Dashboard (Development Only)

Access: http://localhost:3001/#HOP33EXELENCE

**Setup TOTP**:
1. Visit http://localhost:3001/api/admin/setup-totp
2. Scan QR code with Google Authenticator or Authy
3. Login with admin email and 6-digit code

**Features**:
- View contact submissions
- Manage blog articles (create, edit, delete, publish/draft)
- View analytics dashboard
- Article rich text editor

---

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change brand colors:

```javascript
colors: {
  navy: '#192b58',    // Primary navy blue
  gold: '#ffcb04',    // Accent gold/yellow
}
```

### Fonts

Custom fonts are in `public/fonts/`:
- **Masvis.otf**: Display/heading font
- **ArgentCF-Regular.ttf**: Body text font

Loaded in `src/index.css`.

### Logo

Replace logos in `public/assets/logo/`:
- `logo-white.png`: Used in navbar (dark backgrounds)
- `logo-black.png`: Used in TOTP setup and light backgrounds

### Translations

Edit `src/i18n.ts` to modify translations:

```typescript
export const translations = {
  en: {
    nav: { home: 'Home', about: 'About Us', ... },
    contact: { heading: 'Get in Touch', ... },
    // ...
  },
  id: {
    nav: { home: 'Beranda', about: 'Tentang Kami', ... },
    contact: { heading: 'Hubungi Kami', ... },
    // ...
  },
};
```

---

## 🐛 Troubleshooting

### Development Server Issues

**Port already in use**:
```bash
# Kill process on port 3001
npx kill-port 3001

# Or change port in .env
PORT=3002
```

### Build Errors

**TypeScript errors**:
```bash
npx tsc --noEmit
```

**Dependency issues**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### OTP Emails Not Sending (Development)

**No API key configured**: 
- OTP codes are logged to console
- Check terminal output for code

**API key invalid**:
- Verify key in `.env` file
- Check Resend dashboard for key status

### Contact Form Network Error

**In Development**:
- Ensure backend is running: `npm run dev`
- Check http://localhost:3001 is accessible

**In Production (Vercel)**:
- Verify environment variables are set
- Check Vercel Functions logs
- Test API endpoint directly

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run dev:client` | Start only frontend (Vite) |
| `npm run dev:server` | Start only backend (Express) |
| `npm run build` | Build for production |
| `npm run vercel-build` | Build for Vercel deployment |
| `npm run serve` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔒 Security

### Best Practices Implemented:

- ✅ **Environment Variables**: Secrets in `.env` (not committed)
- ✅ **OTP Hashing**: SHA-256 hash of OTP codes
- ✅ **Rate Limiting**: Prevents spam and abuse
- ✅ **CORS**: Configured for security
- ✅ **JWT Authentication**: Admin dashboard protected
- ✅ **Input Validation**: Email and form validation
- ✅ **XSS Protection**: React's built-in escaping

### Security Considerations:

⚠️ **Production Recommendations**:
- Use persistent storage for OTP (Vercel KV, Redis)
- Implement CAPTCHA for contact form
- Add CSP headers
- Enable rate limiting at CDN level
- Use secure cookie flags for admin session
- Regular dependency updates (`npm audit`)

---

## 📊 Performance

### Optimization Features:

- **Code Splitting**: React lazy loading
- **Image Optimization**: Optimized assets
- **CSS Purging**: Tailwind removes unused styles
- **Minification**: Production builds minified
- **CDN**: Vercel's global edge network
- **Caching**: Static assets cached at edge

### Performance Metrics (Target):

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

---

## 🤝 Contributing

### Development Workflow:

1. Create feature branch from `main`
2. Make changes and test locally
3. Run build: `npm run build`
4. Commit with descriptive message
5. Push and create pull request

### Code Style:

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Formatting**: Consistent indentation (2 spaces)

---

## 📄 License

Proprietary - All rights reserved by HOPE The Organizer

---

## 📞 Support

- **Website**: https://hopeorganizer.com
- **Email**: contact@hopeorganizer.com
- **Address**: Jl. Taman Muara Mas No 39, Semarang, Indonesia

---

## 🎉 Acknowledgments

Built with:
- React by Meta
- Vite by Evan You
- Tailwind CSS by Adam Wathan
- GSAP by GreenSock
- Vercel for hosting
- Resend for email delivery

---

**Version**: 1.0.0  
**Last Updated**: August 8, 2026  
**Status**: Production Ready  
**Maintained by**: HOPE The Organizer Development Team
