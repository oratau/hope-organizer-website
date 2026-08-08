import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { Resend } from 'resend';

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@hopeorganizer.com';

const resendClient = RESEND_API_KEY && RESEND_API_KEY !== 're_your_api_key_here'
  ? new Resend(RESEND_API_KEY)
  : null;

// In-memory OTP store (temporary - consider using Vercel KV or Redis for production)
interface OtpEntry {
  hash: string;
  expiry: number;
  resendCount: number;
  lastResent: number;
  verified: boolean;
  email: string;
  name: string;
  message: string;
}

// Using global to persist across function invocations (temporary solution)
const otpStore = (global as any).otpStore || new Map<string, OtpEntry>();
if (!(global as any).otpStore) (global as any).otpStore = otpStore;

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_RESEND = 3;

const hashOtp = (otp: string): string =>
  crypto.createHash('sha256').update(otp).digest('hex');

const generateOtp = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

const sendOtpEmail = async (toEmail: string, toName: string, otp: string): Promise<{ ok: boolean; error?: string }> => {
  const subject = 'Your OTP Code - HOPE';
  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 32px; border-radius: 8px; border: 1px solid #21262d;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px; font-weight: bold; color: #ffcb04; letter-spacing: 2px;">HOPE</span>
        <span style="font-size: 14px; color: #8b949e; display: block; margin-top: 4px;">The Organizer</span>
      </div>
      <h2 style="color: #f0f6fc; font-size: 20px; margin-bottom: 8px;">Your Verification Code</h2>
      <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Hello ${toName}, please use the code below to verify your email and submit your inquiry.</p>
      <div style="background: #161b22; border: 2px solid #ffcb04; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px; font-weight: bold; letter-spacing: 16px; color: #ffcb04; font-family: 'Courier New', monospace;">${otp}</span>
      </div>
      <p style="color: #8b949e; font-size: 13px; margin-bottom: 8px;">⏱ This code expires in <strong style="color: #f0f6fc;">5 minutes</strong>.</p>
      <p style="color: #8b949e; font-size: 13px;">If you did not request this code, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #21262d; margin: 24px 0;" />
      <p style="color: #484f58; font-size: 12px; text-align: center;">HOPE The Organizer · Jl. Taman Muara Mas No 39, Semarang</p>
    </div>
  `;

  if (!resendClient) {
    console.log('\n' + '═'.repeat(50));
    console.log(`📧 OTP EMAIL (no API key — console fallback)`);
    console.log(`To: ${toEmail}`);
    console.log(`OTP Code: ${otp}`);
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
      return { ok: false, error: result.error.message };
    }
    return { ok: true };
  } catch (err: any) {
    console.error('Email send failed:', err);
    return { ok: false, error: err.message };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required before sending OTP.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
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
}
