import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@hopeorganizer.com';

const resendClient = RESEND_API_KEY && RESEND_API_KEY !== 're_your_api_key_here'
  ? new Resend(RESEND_API_KEY)
  : null;

// Using global to access shared OTP store
const otpStore = (global as any).otpStore || new Map();
if (!(global as any).otpStore) (global as any).otpStore = otpStore;

// Rate limiting
const contactRateMap = (global as any).contactRateMap || new Map<string, number>();
if (!(global as any).contactRateMap) (global as any).contactRateMap = contactRateMap;

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
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.headers['x-real-ip'] as string || '127.0.0.1';

  // Rate limiting
  const lastTime = contactRateMap.get(clientIp);
  const now = Date.now();
  if (lastTime && now - lastTime < 10000) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a few seconds.',
    });
  }
  contactRateMap.set(clientIp, now);

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields (Name, Email, Message) are required.',
    });
  }

  // OTP verification guard
  const otpEntry = otpStore.get(email);
  if (!otpEntry || !otpEntry.verified) {
    return res.status(403).json({
      success: false,
      message: 'Email not verified. Please verify your email with OTP before submitting.',
    });
  }

  // Clear OTP after successful submission (single use)
  otpStore.delete(email);

  // Send confirmation email
  if (resendClient) {
    try {
      await resendClient.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Thank you for contacting HOPE The Organizer!',
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #0d1117; color: #e6edf3; padding: 32px; border-radius: 8px; border: 1px solid #21262d;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 28px; font-weight: bold; color: #ffcb04; letter-spacing: 2px;">HOPE</span>
              <span style="font-size: 14px; color: #8b949e; display: block; margin-top: 4px;">The Organizer</span>
            </div>
            <h2 style="color: #f0f6fc; font-size: 20px; margin-bottom: 8px;">Thank You, ${name}!</h2>
            <p style="color: #8b949e; font-size: 14px; margin-bottom: 16px;">We have received your inquiry and our team will contact you within 24 hours.</p>
            <p style="color: #8b949e; font-size: 14px; margin-bottom: 16px;"><strong style="color: #f0f6fc;">Your message:</strong><br/>${message}</p>
            <hr style="border: none; border-top: 1px solid #21262d; margin: 24px 0;" />
            <p style="color: #484f58; font-size: 12px; text-align: center;">HOPE The Organizer · Jl. Taman Muara Mas No 39, Semarang</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
  } else {
    console.log(`\n📧 AUTO REPLY → ${email} (Hello ${name}, your inquiry was received.)\n`);
  }

  return res.json({
    success: true,
    message: 'Thank you! Your message has been received. We will contact you within 24 hours.',
    submissionId: `submission_${Date.now()}`,
  });
}
