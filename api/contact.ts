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
      const baseUrl = 'https://hopeenterprise.vercel.app';
      await resendClient.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Thank you for contacting HOPE The Organizer!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000;">
  <div style="width: 100%; background-color: #000000; background-image: url('${baseUrl}/assets/email/hope%20pattern.png'); background-size: cover; background-position: center; background-repeat: no-repeat; padding: 40px 20px;">
    <div style="max-width: 700px; margin: 0 auto; background-color: rgba(0, 0, 0, 0.5); padding: 40px;">
      
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 40px;">
        <img src="${baseUrl}/assets/email/logo-white.png" alt="HOPE The Organizer" style="height: 60px; max-width: 280px;" />
      </div>
      
      <!-- Title -->
      <h1 style="margin: 0 0 15px 0; font-size: 46px; font-weight: normal; color: #ffd700; font-family: Georgia, 'Times New Roman', serif;">
        Hello, ${name}
      </h1>
      
      <!-- Subtitle -->
      <p style="margin: 0 0 40px 0; font-size: 18px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; line-height: 1.5;">
        Thank you For Contacting Us,<br>
        We Will Reply<br>
        Within 24 Hours.
      </p>
      
      <!-- Content Area -->
      <div style="display: table; width: 100%; margin-bottom: 40px;">
        <div style="display: table-cell; width: 45%; vertical-align: top; padding-right: 20px;">
          <img src="${baseUrl}/assets/email/mascotHappy.png" alt="HOPE Mascot" style="width: 100%; max-width: 280px; height: auto;" />
        </div>
        <div style="display: table-cell; width: 55%; vertical-align: top;">
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif;">
            Your Message:
          </p>
          <div style="background-color: #192b58; padding: 25px 20px;">
            <p style="margin: 0; font-size: 14px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; word-wrap: break-word;">
              ${message}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Contact Info -->
      <div style="margin-bottom: 40px;">
        <img src="${baseUrl}/assets/email/ContactInformation.png" alt="Contact Information" style="width: 100%; max-width: 686px; height: auto;" />
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 0; background: linear-gradient(to bottom, transparent 0%, #192b58 50%);">
        <p style="margin: 0; font-size: 18px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-style: italic;">
          Best Regards, HOPE Organizer.
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>
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
