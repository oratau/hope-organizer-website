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
                      <td align="center" style="padding: 60px 60px 40px 60px;">
                        <img src="${baseUrl}/assets/email/logo-white.png" alt="HOPE The Organizer" style="height: 60px; max-width: 280px; display: block;" />
                      </td>
                    </tr>
                    
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0 70px 12px 70px;">
                        <h1 style="margin: 0; font-size: 46px; font-weight: normal; color: #ffd700; font-family: Georgia, 'Times New Roman', serif; line-height: 1.2;">
                          Hello, ${name}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Subtitle -->
                    <tr>
                      <td style="padding: 0 70px 40px 70px;">
                        <p style="margin: 0; font-size: 18px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; line-height: 1.4; font-weight: normal;">
                          Thank you For Contacting Us,<br>
                          We Will Reply<br>
                          Within 24 Hours.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content Area with Mascot and Message Box -->
                    <tr>
                      <td style="padding: 0 70px 40px 70px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <!-- Left: Mascot -->
                            <td width="45%" style="vertical-align: top; padding-right: 20px;">
                              <img src="${baseUrl}/assets/email/mascotHappy.png" alt="HOPE Mascot" style="width: 100%; max-width: 280px; height: auto; display: block;" />
                            </td>
                            <!-- Right: Message Box -->
                            <td width="55%" style="vertical-align: top;">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td style="padding-bottom: 12px;">
                                    <p style="margin: 0; font-size: 16px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-weight: normal;">
                                      Your Message:
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #192b58;">
                                      <tr>
                                        <td style="padding: 25px 20px;">
                                          <p style="margin: 0; font-size: 14px; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; word-wrap: break-word;">
                                            ${message}
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
                      <td align="center" style="padding: 55px 40px 65px 40px; background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, #192b58 35%, #192b58 100%);">
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
