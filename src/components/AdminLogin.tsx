import React, { useState } from 'react';
import { X, Lock, ShieldAlert, KeyRound, QrCode, AlertTriangle } from 'lucide-react';
import { Logo } from './Logo';

interface AdminLoginProps {
  onClose: () => void;
  onSuccessLogin: (token: string) => void;
  onOpenSetup: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onClose,
  onSuccessLogin,
  onOpenSetup,
}) => {
  const [email, setEmail] = useState('admin@hopeorganizer.com');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [retryAfterSecs, setRetryAfterSecs] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !totpCode || totpCode.length < 6) {
      setError('Please enter your admin email and a valid 6-digit TOTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: totpCode }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Rate limited / locked out
        setIsLocked(true);
        setAttemptsRemaining(0);
        setRetryAfterSecs(data.retryAfterSecs || 900);
        setError(data.message || 'Too many failed attempts. Please wait before trying again.');
        return;
      }

      if (res.ok && data.success && data.token) {
        onSuccessLogin(data.token);
      } else {
        setError(data.message || 'Invalid TOTP code. Codes refresh every 30 seconds.');
        if (typeof data.attemptsRemaining === 'number') {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        setTotpCode('');
      }
    } catch (err) {
      // Do NOT bypass on network failure — show clear error
      setError('Could not reach the authentication server. Please make sure the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLockTime = (secs: number) => {
    const m = Math.ceil(secs / 60);
    return m === 1 ? '1 minute' : `${m} minutes`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#121624] border border-[#ffcb04]/40 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Gold top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#192b58] via-[#ffcb04] to-[#192b58]" />

        <div className="p-6 space-y-5">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="text-center space-y-2 pt-2">
            <div className="inline-block">
              <Logo variant="badge" />
            </div>
            <h2 className="font-serif font-bold text-xl text-white tracking-wide pt-2">
              ADMINISTRATOR PORTAL
            </h2>
            <p className="text-xs text-gray-400">
              Protected by Time-Based One-Time Password (TOTP 2FA)
            </p>
          </div>

          {/* Error / Lock Alert */}
          {error && (
            <div className={`border text-xs p-3 rounded flex items-start space-x-2 ${
              isLocked
                ? 'bg-orange-950/80 border-orange-600 text-orange-200'
                : 'bg-rose-950/80 border-rose-600 text-rose-200'
            }`}>
              {isLocked ? (
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span>{error}</span>
                {isLocked && retryAfterSecs && (
                  <p className="text-orange-300 font-semibold">
                    Retry in: {formatLockTime(retryAfterSecs)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Attempts Warning */}
          {!isLocked && attemptsRemaining !== null && attemptsRemaining <= 3 && (
            <div className="bg-yellow-950/60 border border-yellow-700 text-yellow-300 text-xs p-2.5 rounded flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                <strong>{attemptsRemaining}</strong> attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before lockout.
              </span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-sm font-sans">
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                disabled={isLocked}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffcb04] transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  6-Digit Authenticator Code (TOTP)
                </label>
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenSetup(); }}
                  className="text-[11px] text-[#ffcb04] hover:underline flex items-center space-x-1"
                >
                  <QrCode className="w-3 h-3" />
                  <span>QR Setup</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                autoFocus
                disabled={isLocked}
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#0a0a0a] border border-[#ffcb04]/60 rounded-lg py-3 text-center text-2xl tracking-widest font-mono font-bold text-[#ffcb04] focus:outline-none focus:ring-2 focus:ring-[#ffcb04] focus:border-[#ffcb04] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-500 mt-1 text-center">
                Open Google Authenticator or Authy to get your code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full bg-[#ffcb04] text-black font-bold py-3 rounded-lg hover:bg-[#e5b600] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Verify TOTP & Enter Admin'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-gray-800/60 text-center">
            <p className="text-[11px] text-gray-500">
              Not configured 2FA yet?{' '}
              <button
                onClick={() => { onClose(); onOpenSetup(); }}
                className="text-[#ffcb04] hover:underline font-semibold"
              >
                Open TOTP QR Setup
              </button>
            </p>
            <p className="text-[10px] text-gray-600 mt-1">
              Secret route: navigate to <code className="text-gray-500">/#HOP33EXELENCE</code>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
