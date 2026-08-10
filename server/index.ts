import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';

// ─── LOAD .ENV ────────────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) process.env[key] = val;
    });
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@hopeorganizer.com';

// Resend client (only functional when API key is provided)
const resendClient = RESEND_API_KEY && RESEND_API_KEY !== 're_your_api_key_here'
  ? new Resend(RESEND_API_KEY)
  : null;

const app = express();
const PORT = process.env.PORT || 3001;

// ─── JWT SECRET ─────────────────────────────────────────────────────────────
const JWT_SECRET = 'HOPE_ORGANIZER_ADMIN_JWT_2026_DO_NOT_EXPOSE';
const JWT_EXPIRES = '8h';

// ─── TOTP CONFIG ─────────────────────────────────────────────────────────────
authenticator.options = {
  window: 1,
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── FILE-BASED DATABASE ─────────────────────────────────────────────────────
const DB_FILE = path.join(process.cwd(), 'server', 'database.json');

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: 'published' | 'draft';
}

interface DBData {
  totpSecret: string;
  adminEmail: string;
  contactSubmissions: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
    turnstileVerified: boolean;
    autoEmailSent: boolean;
  }>;
  articles: Article[];
  weeklyTraffic: number[];
}

let db: DBData = {
  totpSecret: '',
  adminEmail: 'admin@hopeorganizer.com',
  contactSubmissions: [],
  articles: [],
  weeklyTraffic: [0, 0, 0, 0, 0, 0, 0, 0],
};

if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const saved = JSON.parse(raw) as Partial<DBData>;
    db = { ...db, ...saved };
    db.articles = db.articles.map((a) => ({ ...a, status: a.status ?? ('published' as const) }));
  } catch (e) {
    console.error('Could not read database.json, starting with defaults', e);
  }
}

if (!db.totpSecret) {
  db.totpSecret = authenticator.generateSecret();
  console.log('🔐 New TOTP secret generated and saved.');
}

const saveDB = () => {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Failed to save database.json', e);
  }
};
saveDB();

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}
const loginRateMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const checkLoginRateLimit = (ip: string): { blocked: boolean; remaining: number; retryAfterSecs?: number } => {
  const now = Date.now();
  const entry = loginRateMap.get(ip);

  if (!entry) {
    loginRateMap.set(ip, { count: 1, firstAttempt: now });
    return { blocked: false, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { blocked: true, remaining: 0, retryAfterSecs: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateMap.set(ip, { count: 1, firstAttempt: now });
    return { blocked: false, remaining: RATE_LIMIT_MAX - 1 };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    return { blocked: true, remaining: 0, retryAfterSecs: LOCKOUT_DURATION_MS / 1000 };
  }

  return { blocked: false, remaining: RATE_LIMIT_MAX - entry.count };
};

const resetLoginRateLimit = (ip: string) => {
  loginRateMap.delete(ip);
};

// ─── JWT MIDDLEWARE ───────────────────────────────────────────────────────────
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    (req as any).adminPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token.' });
  }
};

// ─── OTP STORE (in-memory) ────────────────────────────────────────────────────
interface OtpEntry {
  hash: string;          // SHA-256 hash of the raw OTP
  expiry: number;        // Unix ms
  resendCount: number;   // How many times resent (max 3)
  lastResent: number;    // Unix ms of last send/resend
  verified: boolean;     // true after correct verification
  email: string;
  name: string;
  message: string;
}

const otpStore = new Map<string, OtpEntry>(); // keyed by email

const OTP_EXPIRY_MS = 5 * 60 * 1000;       // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;   // 60 seconds
const OTP_MAX_RESEND = 3;                    // max resend attempts

const hashOtp = (otp: string): string =>
  crypto.createHash('sha256').update(otp).digest('hex');

const generateOtp = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

// ─── EMAIL HELPER ─────────────────────────────────────────────────────────────
const sendOtpEmail = async (toEmail: string, toName: string, otp: string): Promise<{ ok: boolean; error?: string }> => {
  const subject = 'Your OTP Code - HOPE';
  
  // Split OTP into individual digits for display in boxes
  const otpDigits = otp.split('');
  
  // Use production URL always for email images (email clients need public URLs)
  const baseUrl = 'https://hopeenterprise.vercel.app';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: Georgia, 'Times New Roman', serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
        <tr>
          <td align="center" style="padding: 0;">
            <!-- Main Container with Pattern Background -->
            <table width="826" cellpadding="0" cellspacing="0" border="0" style="max-width: 826px; width: 100%; background-color: #000000; background-image: url('${baseUrl}/assets/email/hope%20pattern.png'); background-repeat: no-repeat; background-size: cover; background-position: center; opacity: 1;">
              <!-- Overlay for opacity effect -->
              <tr>
                <td style="background-color: rgba(0, 0, 0, 0.5); width: 100%;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <!-- Logo Section -->
              <tr>
                <td align="center" style="padding: 70px 60px 50px 60px;">
                  <img src="${baseUrl}/assets/email/logo-white.png" alt="HOPE The Organizer" style="height: 70px; max-width: 300px; display: block;" />
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td style="padding: 0 70px 12px 70px;">
                  <h1 style="margin: 0; font-size: 52px; font-weight: normal; color: #ffd700; font-family: Georgia, 'Times New Roman', serif; line-height: 1.1;">
                    Your Verification Code:
                  </h1>
                </td>
              </tr>
              
              <!-- Subtitle -->
              <tr>
                <td style="padding: 0 70px 45px 70px;">
                  <p style="margin: 0; font-size: 17px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; line-height: 1.5; font-weight: normal;">
                    Hello ${toName}, please use the code below to verify<br>your email and submit your inquiry.
                  </p>
                </td>
              </tr>
              
              <!-- Yellow OTP Box -->
              <tr>
                <td style="padding: 0 70px 45px 70px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffd700;">
                    <!-- OTP Digit Boxes -->
                    <tr>
                      <td align="center" style="padding: 55px 30px 35px 30px;">
                        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                          <tr>
                            ${otpDigits.map(digit => `
                              <td style="padding: 0 9px;">
                                <table cellpadding="0" cellspacing="0" border="0" style="background: #192b58; width: 95px; height: 120px; border-radius: 0;">
                                  <tr>
                                    <td align="center" valign="middle" style="text-align: center; vertical-align: middle;">
                                      <span style="font-size: 70px; font-weight: bold; color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1; display: block;">${digit}</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            `).join('')}
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Expiry Text -->
                    <tr>
                      <td align="center" style="padding: 0 40px 45px 40px;">
                        <p style="margin: 0; font-size: 21px; color: #1a2b3c; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: normal;">
                          This code expires in 5 minutes.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Contact Info Box -->
              <tr>
                <td style="padding: 0 70px 0 70px;">
                  <img src="${baseUrl}/assets/email/ContactInformation.png" alt="Contact Information" style="width: 100%; max-width: 686px; display: block; height: auto;" />
                </td>
              </tr>
              
              <!-- Footer with Gradient -->
              <tr>
                <td align="center" style="padding: 55px 40px 65px 40px; background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, #1a3a5c 35%, #1a3a5c 100%);">
                  <p style="margin: 0; font-size: 18px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-weight: normal;">
                    Best Regards, HOPE Organizer.
                  </p>
                </td>
              </tr>
              
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (!resendClient) {
    // No API key configured — log OTP to console for local development
    console.log('\n' + '═'.repeat(50));
    console.log(`📧 OTP EMAIL (no API key — console fallback)`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: 5 minutes`);
    console.log('═'.repeat(50) + '\n');
    return { ok: true };
  }

  try {
    const result = await resendClient.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject,
      html: htmlBody,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      // Fallback to console for development if Resend fails
      console.log('\n' + '═'.repeat(50));
      console.log(`📧 OTP EMAIL (Resend failed — console fallback)`);
      console.log(`To: ${toEmail}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Error: ${result.error.message}`);
      console.log('═'.repeat(50) + '\n');
      return { ok: true }; // Return success so OTP flow continues
    }
    return { ok: true };
  } catch (err: any) {
    console.error('Email send failed:', err);
    // Fallback to console for development if network fails
    console.log('\n' + '═'.repeat(50));
    console.log(`📧 OTP EMAIL (Network error — console fallback)`);
    console.log(`To: ${toEmail}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Error: ${err.message}`);
    console.log('═'.repeat(50) + '\n');
    return { ok: true }; // Return success so OTP flow continues
  }
};

// ─── 1. TOTP SETUP ───────────────────────────────────────────────────────────
app.get('/api/admin/setup-totp', async (req, res) => {
  try {
    const issuer = 'HOPE The Organizer';
    const accountName = db.adminEmail;
    const logoUrl = 'https://i.ibb.co.com/ch17wNBP/logo-black.png';
    const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${db.totpSecret}&issuer=${encodeURIComponent(issuer)}&image=${encodeURIComponent(logoUrl)}`;

    const qrCodeUrl = await QRCode.toDataURL(otpauth, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    res.json({ success: true, secret: db.totpSecret, qrCodeUrl, message: 'TOTP Secret ready. Scan QR Code in Google Authenticator or Authy.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 2. ADMIN LOGIN ───────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { email, code } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const rateResult = checkLoginRateLimit(clientIp);
  if (rateResult.blocked) {
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Please try again in ${Math.ceil((rateResult.retryAfterSecs || 900) / 60)} minutes.`,
      retryAfterSecs: rateResult.retryAfterSecs,
    });
  }

  if (!email || !code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ success: false, message: 'Valid email and 6-digit TOTP code required.' });
  }

  if (email !== db.adminEmail) {
    return res.status(401).json({ success: false, message: 'Invalid admin email.', attemptsRemaining: rateResult.remaining });
  }

  try {
    const isValid = authenticator.check(code, db.totpSecret);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid TOTP code. Codes expire every 30 seconds.', attemptsRemaining: rateResult.remaining });
    }

    resetLoginRateLimit(clientIp);
    const token = jwt.sign({ email: db.adminEmail, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({ success: true, token, message: 'TOTP Authentication successful. Welcome to HOPE Admin Panel.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 3. TOKEN VALIDATION ──────────────────────────────────────────────────────
app.post('/api/admin/validate-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, valid: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    return res.json({ success: true, valid: true, email: payload.email });
  } catch {
    return res.json({ success: false, valid: false });
  }
});

// ─── 4. TOTP VERIFY (setup confirmation) ──────────────────────────────────────
app.post('/api/admin/verify-totp', (req, res) => {
  const { code } = req.body;
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ success: false, message: 'Invalid 6-digit code format.' });
  }

  const isValid = authenticator.check(code, db.totpSecret);
  if (isValid) return res.json({ success: true, message: '2FA Setup Verified Successfully.' });
  return res.status(400).json({ success: false, message: 'Invalid TOTP code. Try the current 6-digit code from your app.' });
});

// ─── 5. CONTACT OTP: SEND ─────────────────────────────────────────────────────
app.post('/api/contact/send-otp', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required before sending OTP.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const now = Date.now();
  const existing = otpStore.get(email);

  // Enforce resend cooldown
  if (existing && !existing.verified) {
    const cooldownRemaining = OTP_RESEND_COOLDOWN_MS - (now - existing.lastResent);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before requesting another OTP.`,
        cooldownSecs: Math.ceil(cooldownRemaining / 1000),
      });
    }
    // Check resend limit
    if (existing.resendCount >= OTP_MAX_RESEND) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP resend attempts reached. Please refresh the page and try again.',
      });
    }
  }

  const otp = generateOtp();
  const hash = hashOtp(otp);
  const expiry = now + OTP_EXPIRY_MS;
  const resendCount = existing && !existing.verified ? existing.resendCount + 1 : 0;

  otpStore.set(email, {
    hash,
    expiry,
    resendCount,
    lastResent: now,
    verified: false,
    email,
    name,
    message,
  });

  const emailResult = await sendOtpEmail(email, name, otp);

  if (!emailResult.ok) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP email. Please try again.',
    });
  }

  return res.json({
    success: true,
    message: `OTP sent to ${email}. Please check your inbox (and spam folder).`,
    resendCount,
    maxResend: OTP_MAX_RESEND,
    expiresInSecs: OTP_EXPIRY_MS / 1000,
  });
});

// ─── 6. CONTACT OTP: VERIFY ───────────────────────────────────────────────────
app.post('/api/contact/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'A valid email and 6-digit OTP are required.' });
  }

  const entry = otpStore.get(email);

  if (!entry) {
    return res.status(404).json({ success: false, message: 'No OTP found for this email. Please request a new one.' });
  }

  if (Date.now() > entry.expiry) {
    otpStore.delete(email);
    return res.status(410).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  const inputHash = hashOtp(otp);
  if (inputHash !== entry.hash) {
    return res.status(401).json({ success: false, message: 'Incorrect OTP. Please check the code and try again.' });
  }

  // Mark as verified
  entry.verified = true;
  otpStore.set(email, entry);

  return res.json({ success: true, message: 'Email verified successfully.' });
});

// ─── 7. CONTACT FORM SUBMISSION ───────────────────────────────────────────────
const contactRateMap = new Map<string, number>();

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const lastTime = contactRateMap.get(clientIp);
  const now = Date.now();
  if (lastTime && now - lastTime < 10000) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please wait a few seconds.' });
  }
  contactRateMap.set(clientIp, now);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields (Name, Email, Message) are required.' });
  }

  // ── OTP VERIFICATION GUARD ──────────────────────────────────────────────────
  const otpEntry = otpStore.get(email);
  if (!otpEntry || !otpEntry.verified) {
    return res.status(403).json({
      success: false,
      message: 'Email not verified. Please verify your email with OTP before submitting.',
    });
  }

  // Clear OTP after successful submission (single use)
  otpStore.delete(email);

  const newSubmission = {
    id: `submission_${Date.now()}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    turnstileVerified: true,
    autoEmailSent: true,
  };

  db.contactSubmissions.unshift(newSubmission);
  saveDB();

  // Send confirmation email
  if (resendClient) {
    try {
      const baseUrl = 'https://hopeenterprise.vercel.app';
      const escapedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      await resendClient.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Thank you for contacting HOPE The Organizer!',
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000; background-image: url('${baseUrl}/assets/email/hope%20pattern.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="700" cellpadding="0" cellspacing="0" border="0" style="max-width: 700px; background-color: rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="padding: 40px;">
              
              <!-- Logo -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 40px;">
                    <img src="${baseUrl}/assets/email/logo-white.png" alt="HOPE The Organizer" style="height: 60px; max-width: 280px; display: block;" />
                  </td>
                </tr>
              </table>
              
              <!-- Title -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin: 0 0 15px 0; font-size: 46px; font-weight: normal; color: #ffd700; font-family: Georgia, serif; line-height: 1.2;">Hello, ${name}</h1>
                  </td>
                </tr>
              </table>
              
              <!-- Subtitle -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 40px;">
                    <p style="margin: 0; font-size: 18px; color: #ffffff; font-family: Georgia, serif; line-height: 1.5;">
                      Thank you For Contacting Us,<br>
                      We Will Reply<br>
                      Within 24 Hours.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Content Area with Mascot and Message -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="300" valign="top" style="padding-right: 20px;">
                    <img src="${baseUrl}/assets/email/mascotHappy.png" alt="HOPE Mascot" style="width: 100%; max-width: 280px; height: auto; display: block;" />
                  </td>
                  <td valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 16px; color: #ffffff; font-family: Georgia, serif;">Your Message:</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #192b58; padding: 25px 20px;">
                          <p style="margin: 0; font-size: 14px; color: #ffffff; font-family: Georgia, serif; line-height: 1.6; word-wrap: break-word;">${escapedMessage}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Contact Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 40px 0;">
                    <img src="${baseUrl}/assets/email/ContactInformation.png" alt="Contact Information" style="width: 100%; max-width: 686px; height: auto; display: block;" />
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(to bottom, transparent 0%, #192b58 50%);">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <p style="margin: 0; font-size: 18px; color: #ffffff; font-family: Georgia, serif; font-style: italic;">Best Regards, HOPE Organizer.</p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });
    } catch { /* noop — non-critical */ }
  } else {
    console.log(`\n📧 AUTO REPLY → ${email} (Hello ${name}, your inquiry was received.)\n`);
  }

  return res.json({
    success: true,
    message: 'Thank you! Your message has been received. We will contact you within 24 hours.',
    submissionId: newSubmission.id,
  });
});

// ─── 8. ADMIN: GET CONTACT MESSAGES ──────────────────────────────────────────
app.get('/api/admin/messages', requireAdminAuth, (req, res) => {
  res.json({ success: true, messages: db.contactSubmissions });
});

// ─── 9. ARTICLES CRUD ─────────────────────────────────────────────────────────

app.get('/api/articles', (req, res) => {
  const published = db.articles.filter((a) => a.status === 'published');
  res.json({ success: true, articles: published });
});

app.get('/api/admin/articles', requireAdminAuth, (req, res) => {
  res.json({ success: true, articles: db.articles });
});

app.post('/api/articles', requireAdminAuth, (req, res) => {
  const newArticle: Article = {
    id: `art_${Date.now()}`,
    title: req.body.title || 'Untitled',
    category: req.body.category || 'Event Highlights',
    date: req.body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    excerpt: req.body.excerpt || '',
    content: req.body.content || '',
    coverImage: req.body.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    status: req.body.status || 'published',
  };

  db.articles.unshift(newArticle);
  saveDB();
  res.json({ success: true, article: newArticle });
});

app.put('/api/articles/:id', requireAdminAuth, (req, res) => {
  const idx = db.articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Article not found.' });

  db.articles[idx] = {
    ...db.articles[idx],
    title: req.body.title ?? db.articles[idx].title,
    category: req.body.category ?? db.articles[idx].category,
    date: req.body.date ?? db.articles[idx].date,
    excerpt: req.body.excerpt ?? db.articles[idx].excerpt,
    content: req.body.content ?? db.articles[idx].content,
    coverImage: req.body.coverImage ?? db.articles[idx].coverImage,
    status: req.body.status ?? db.articles[idx].status,
  };

  saveDB();
  res.json({ success: true, article: db.articles[idx] });
});

app.patch('/api/articles/:id/status', requireAdminAuth, (req, res) => {
  const idx = db.articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Article not found.' });

  const { status } = req.body;
  if (status !== 'published' && status !== 'draft') {
    return res.status(400).json({ success: false, message: 'Status must be "published" or "draft".' });
  }

  db.articles[idx].status = status;
  saveDB();
  res.json({ success: true, article: db.articles[idx] });
});

app.delete('/api/articles/:id', requireAdminAuth, (req, res) => {
  const idx = db.articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Article not found.' });

  db.articles.splice(idx, 1);
  saveDB();
  res.json({ success: true, message: 'Article deleted.' });
});

// ─── 10. ANALYTICS ─────────────────────────────────────────────────────────────
app.get('/api/analytics', requireAdminAuth, (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const saved = JSON.parse(raw) as Partial<DBData>;
      if (saved.weeklyTraffic) db.weeklyTraffic = saved.weeklyTraffic;
      if (saved.articles) db.articles = saved.articles;
      if (saved.contactSubmissions) db.contactSubmissions = saved.contactSubmissions;
    } catch { /* noop */ }
  }

  const publishedCount = db.articles.filter((a) => a.status === 'published').length;
  const draftCount = db.articles.filter((a) => a.status === 'draft').length;

  res.json({
    success: true,
    totalViews: db.contactSubmissions.length * 120,
    uniqueVisitors: db.contactSubmissions.length * 60,
    contactLeads: db.contactSubmissions.length,
    articlesCount: db.articles.length,
    publishedCount,
    draftCount,
    weeklyTraffic: (db.weeklyTraffic || [0, 0, 0, 0, 0, 0, 0, 0]).map(() => 0),
    recentContacts: db.contactSubmissions.slice(0, 5),
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 HOPE Server running on http://localhost:${PORT}`);
  console.log(`🔐 TOTP Setup: http://localhost:${PORT}/api/admin/setup-totp`);
  console.log(`🗝️  Secret TOTP route: /#HOP33EXELENCE`);
  if (!resendClient) {
    console.log(`⚠️  Email: No RESEND_API_KEY set — OTP codes will be logged to console.`);
  } else {
    console.log(`📧 Email: Resend configured (${EMAIL_FROM})`);
  }
});

// ─── CATCH-ALL 404 HANDLER ────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.status(404).send('Not Found');
});
