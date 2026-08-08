import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface TotpSetupModalProps {
  onClose: () => void;
  onSuccessSetup: () => void;
}

export const TotpSetupModal: React.FC<TotpSetupModalProps> = ({ onClose, onSuccessSetup }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr');
  const [testCode, setTestCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTotpSetup();
  }, []);

  const fetchTotpSetup = async () => {
    try {
      const res = await fetch('/api/admin/setup-totp');
      const data = await res.json();
      if (data.qrCodeUrl) {
        setQrCodeDataUrl(data.qrCodeUrl);
      }
    } catch (e) {
      // API not available - QR code should be generated server-side
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode || testCode.length < 6) {
      setError('Please enter a 6-digit TOTP code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testCode }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          onSuccessSetup();
        }, 1500);
      } else {
        setError(data.message || 'Invalid 6-digit TOTP code.');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white selection:bg-[#ffcb04] selection:text-black overflow-y-auto">
      
      {/* Header - Sticky Top Bar */}
      <header className="bg-[#192b58] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xl">
        <div className="flex items-center space-x-2">
          <div className="bg-[#ffcb04] p-2 rounded text-black font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-white">
              2FA TOTP SETUP
            </h2>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Close 2FA Setup"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col items-center justify-center flex-1 max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Content Flow */}
        {step === 'qr' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-8">
            <div className="text-center space-y-3">
              <p className="text-xs text-gray-300 max-w-xl mx-auto">
                Scan this QR Code with <strong className="text-[#ffcb04]">Google Authenticator</strong> or <strong className="text-[#ffcb04]">Authy</strong> to pair your admin account with TOTP protection.
              </p>
            </div>

            {/* QR Code Container - Centered for Fullscreen */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-inner">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="2FA TOTP QR Code" className="w-64 h-64 mx-auto" />
                ) : (
                  <div className="w-64 h-64 bg-gray-200 animate-pulse flex items-center justify-center text-gray-500 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="bg-[#ffcb04] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#e5b600] transition-colors text-sm shadow-lg"
            >
              I Have Scanned The QR Code →
            </button>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifySetup} className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-serif font-bold text-xl text-white">
                Verify 6-Digit Code
              </h3>
              <p className="text-xs text-gray-400">
                Enter the 6-digit code currently shown on your authenticator app to complete setup.
              </p>
            </div>

            {error && (
              <div className="bg-rose-950/80 border border-rose-600 text-rose-200 text-xs p-3 rounded">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="Enter code"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#0a0a0a] border border-[#ffcb04] rounded py-3 text-center text-2xl tracking-widest font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#ffcb04]"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep('qr')}
                className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-lg hover:bg-gray-700 text-xs font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={verifying}
                className="flex-[2] bg-[#ffcb04] text-black font-bold py-3 rounded-lg hover:bg-[#e5b600] transition-colors text-xs shadow-lg"
              >
                {verifying ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-emerald-900/60 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">
              2FA TOTP Enabled!
            </h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              2FA TOTP is now enabled. You can now login at <code className="text-[#ffcb04]">/admin</code> using your TOTP app.
            </p>
          </div>
        )}

      </main>
    </div>
  );
};
