import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, CheckCircle2, AlertCircle, Mail, ShieldCheck, RotateCcw, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FooterContactCard } from './FooterContactCard';
import { WatermarkBg } from './WatermarkBg';
import { Translations } from '../i18n';

interface ContactSectionProps {
  t: Translations;
}

// ─── OTP Step types ────────────────────────────────────────────────────────────
type OtpStep = 'form' | 'otp' | 'verified';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECS = 300; // 5 minutes
const MAX_RESEND = 3;
const RESEND_COOLDOWN_SECS = 60;

export const ContactSection: React.FC<ContactSectionProps> = ({ t }) => {
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // OTP flow state
  const [otpStep, setOtpStep] = useState<OtpStep>('form');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0); // secs remaining
  const [otpError, setOtpError] = useState('');

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // OTP digit refs for auto-focus
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Countdown: OTP expiry ────────────────────────────────────────────────
  useEffect(() => {
    if (otpStep !== 'otp') return;
    if (otpExpiry <= 0) return;

    const interval = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setOtpError(t.contact.otpExpired);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpStep, otpExpiry]);

  // ─── Countdown: resend cooldown ────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // ─── Format seconds as mm:ss ───────────────────────────────────────────────
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ─── SEND OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setOtpError('');
    if (!formData.name || !formData.email || !formData.message) {
      setOtpError(t.contact.fillAll);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setOtpError('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/contact/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtpStep('otp');
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setOtpExpiry(OTP_EXPIRY_SECS);
        setResendCooldown(RESEND_COOLDOWN_SECS);
        setResendCount(data.resendCount ?? 0);
        setOtpError('');
        // Focus first digit
        setTimeout(() => digitRefs.current[0]?.focus(), 150);
      } else {
        setOtpError(data.message || 'Failed to send OTP.');
      }
    } catch {
      setOtpError('Network error. Please check your connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ─── RESEND OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendCount >= MAX_RESEND) return;
    setOtpError('');
    setSendingOtp(true);
    try {
      const res = await fetch('/api/contact/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setOtpExpiry(OTP_EXPIRY_SECS);
        setResendCooldown(RESEND_COOLDOWN_SECS);
        setResendCount(data.resendCount ?? resendCount + 1);
        setTimeout(() => digitRefs.current[0]?.focus(), 150);
      } else {
        setOtpError(data.message || 'Failed to resend OTP.');
        if (data.cooldownSecs) setResendCooldown(data.cooldownSecs);
      }
    } catch {
      setOtpError('Network error.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ─── DIGIT INPUT HANDLERS ──────────────────────────────────────────────────
  const handleDigitChange = useCallback((index: number, value: string) => {
    // Allow paste of full OTP
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      digits.forEach((d, i) => { next[i] = d; });
      setOtpDigits(next);
      const focusIdx = Math.min(digits.length, OTP_LENGTH - 1);
      digitRefs.current[focusIdx]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  }, [otpDigits]);

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) digitRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) digitRefs.current[index + 1]?.focus();
  };

  // ─── VERIFY OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== OTP_LENGTH) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/contact/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtpStep('verified');
        setOtpError('');
      } else {
        setOtpError(data.message || t.contact.otpIncorrect);
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ─── SUBMIT FORM ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpStep !== 'verified') return;
    setSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message || t.contact.successMessage });
        setFormData({ name: '', email: '', message: '' });
        setOtpStep('form');
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#ffcb04', '#192b58', '#ffffff'] });
      } else {
        setStatus({ type: 'error', message: data.message || t.contact.errorMessage });
        // If OTP verification was lost, go back to OTP step
        if (response.status === 403) setOtpStep('form');
      }
    } catch {
      setStatus({ type: 'error', message: t.contact.errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormFilled = formData.name.trim() && formData.email.trim() && formData.message.trim();
  const otpFull = otpDigits.join('').length === OTP_LENGTH;
  const canResend = resendCooldown === 0 && resendCount < MAX_RESEND;
  const resendAttemptsLeft = MAX_RESEND - resendCount;

  return (
    <section id="contact-us" className="min-h-screen py-16 relative overflow-hidden">
      <WatermarkBg />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif italic text-4xl sm:text-5xl font-bold text-white tracking-wide">
            {t.contact.heading} <span className="text-[#ffcb04]">{t.contact.headingHighlight}</span>
          </h2>
        </div>

        {/* Contact Form Card */}
        <div className="max-w-3xl mx-auto bg-[#121624] border border-white/10 p-6 sm:p-8 rounded-md shadow-2xl space-y-6 mb-12">

          {/* Header */}
          <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white">{t.contact.sendMessage}</h3>
              <p className="text-gray-400 text-xs mt-1 font-serif">{t.contact.formSubtitle}</p>
            </div>
            {/* Step indicator */}
            <div className="flex items-center space-x-2">
              {(['form', 'otp', 'verified'] as OtpStep[]).map((step, i) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      otpStep === step
                        ? 'bg-[#ffcb04] text-black scale-110'
                        : otpStep === 'otp' && step === 'form' || otpStep === 'verified'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {(otpStep === 'otp' && step === 'form') || otpStep === 'verified' && step !== 'verified' ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`w-5 h-px transition-colors duration-300 ${otpStep !== 'form' && i === 0 || otpStep === 'verified' && i === 1 ? 'bg-emerald-600' : 'bg-gray-700'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Global Status Message */}
          {status.message && (
            <div className={`p-4 rounded text-xs flex items-start space-x-2 ${
              status.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-600 text-rose-200'
            }`}>
              {status.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              }
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-serif text-sm">

            {/* ── STEP 1: FORM FIELDS ─────────────────────────────────────── */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.contact.fullName}</label>
                <input
                  type="text"
                  required
                  disabled={otpStep !== 'form'}
                  placeholder={t.contact.fullNamePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcb04] transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.contact.emailAddress}</label>
                <input
                  type="email"
                  required
                  disabled={otpStep !== 'form'}
                  placeholder={t.contact.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcb04] transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.contact.message}</label>
                <textarea
                  required
                  rows={4}
                  disabled={otpStep !== 'form'}
                  placeholder={t.contact.messagePlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-gray-700 rounded px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcb04] transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* ── OTP ERROR ────────────────────────────────────────────────── */}
            {otpError && (
              <div className="p-3 rounded bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            {/* ── STEP 1 ACTION: SEND OTP BUTTON ────────────────────────── */}
            {otpStep === 'form' && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || !isFormFilled}
                className="w-full bg-[#ffcb04] text-black font-bold py-3 px-6 rounded hover:bg-[#e5b600] transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed font-serif"
              >
                {sendingOtp ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>{t.contact.sendingOtp}</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>{t.contact.sendOtp}</span>
                  </>
                )}
              </button>
            )}

            {/* ── STEP 2: OTP INPUT PANEL ─────────────────────────────────── */}
            {otpStep === 'otp' && (
              <div className="space-y-5 animate-in fade-in duration-300">

                {/* OTP sent info banner */}
                <div className="p-4 rounded bg-blue-950/60 border border-blue-800/60 text-blue-200 text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                      <strong className="text-white">{t.contact.otpSentTo}</strong>{' '}
                      <span className="text-[#ffcb04] font-semibold">{formData.email}</span>
                    </span>
                  </div>
                  <div className="pl-6">
                    {t.contact.otpSentHint}{' '}
                    <span className={`font-bold ${otpExpiry < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatTime(otpExpiry)}
                    </span>
                  </div>
                </div>

                {/* 6-digit OTP boxes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-3">{t.contact.otpLabel}</label>
                  <div className="flex space-x-2 justify-center sm:justify-start">
                    {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { digitRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={OTP_LENGTH}
                        value={otpDigits[i]}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className={`w-12 h-14 text-center text-2xl font-bold font-mono rounded border-2 bg-[#0a0a0a] text-white placeholder-gray-700 focus:outline-none transition-all duration-200 ${
                          otpDigits[i]
                            ? 'border-[#ffcb04] text-[#ffcb04] shadow-[0_0_12px_rgba(255,203,4,0.3)]'
                            : 'border-gray-700 focus:border-[#ffcb04]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Verify OTP button */}
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || !otpFull || otpExpiry === 0}
                  className="w-full bg-[#ffcb04] text-black font-bold py-3 px-6 rounded hover:bg-[#e5b600] transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed font-serif"
                >
                  {verifyingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>{t.contact.verifyingOtp}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.contact.verifyOtp}</span>
                    </>
                  )}
                </button>

                {/* Resend + Change email controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 text-xs text-gray-400">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || sendingOtp}
                      className={`flex items-center space-x-1.5 transition-colors font-semibold ${
                        canResend && !sendingOtp
                          ? 'text-[#ffcb04] hover:text-[#e5b600]'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>
                        {resendCooldown > 0
                          ? `${t.contact.resendCooldown} ${formatTime(resendCooldown)}`
                          : t.contact.resendOtp}
                      </span>
                    </button>
                    {resendCount > 0 && resendAttemptsLeft > 0 && (
                      <span className="text-gray-600">
                        ({resendAttemptsLeft} {t.contact.resendAttemptsLeft})
                      </span>
                    )}
                    {resendCount >= MAX_RESEND && (
                      <span className="text-rose-500">{t.contact.otpMaxResend}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('form');
                      setOtpDigits(Array(OTP_LENGTH).fill(''));
                      setOtpError('');
                      setResendCount(0);
                    }}
                    className="text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                  >
                    ← Change email
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: VERIFIED — SUBMIT ─────────────────────────────── */}
            {otpStep === 'verified' && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* Verified badge */}
                <div className="p-3 rounded bg-emerald-950/70 border border-emerald-700 text-emerald-200 text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-300">{t.contact.emailVerifiedBadge}</span>
                    <span className="mx-1.5 text-emerald-700">·</span>
                    <span>{formData.email}</span>
                  </div>
                </div>

                {/* Final submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#ffcb04] text-black font-bold py-3 px-6 rounded hover:bg-[#e5b600] transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 font-serif"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>{t.contact.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.contact.submit}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpStep('form'); setOtpDigits(Array(OTP_LENGTH).fill('')); setOtpError(''); setResendCount(0); }}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1 flex items-center justify-center space-x-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Reset & start over</span>
                </button>
              </div>
            )}

          </form>
        </div>

        {/* Footer Contact Card */}
        <FooterContactCard t={t} />

        {/* Copyright Footer */}
        <div className="mt-8 text-center text-xs text-[#ffcb04] font-serif tracking-wider">
          {t.contact.copyright}
        </div>

      </div>
    </section>
  );
};
