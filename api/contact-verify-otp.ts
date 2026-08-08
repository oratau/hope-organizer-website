import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Using global to access shared OTP store
const otpStore = (global as any).otpStore || new Map();
if (!(global as any).otpStore) (global as any).otpStore = otpStore;

const hashOtp = (otp: string): string =>
  crypto.createHash('sha256').update(otp).digest('hex');

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

  const { email, otp } = req.body;

  if (!email || !otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email and 6-digit OTP are required.',
    });
  }

  const entry = otpStore.get(email);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'No OTP found for this email. Please request a new one.',
    });
  }

  if (Date.now() > entry.expiry) {
    otpStore.delete(email);
    return res.status(410).json({
      success: false,
      message: 'OTP has expired. Please request a new one.',
    });
  }

  const inputHash = hashOtp(otp);
  if (inputHash !== entry.hash) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect OTP. Please check the code and try again.',
    });
  }

  // Mark as verified
  entry.verified = true;
  otpStore.set(email, entry);

  return res.json({
    success: true,
    message: 'Email verified successfully.',
  });
}
