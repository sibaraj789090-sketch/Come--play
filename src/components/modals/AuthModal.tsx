import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, Smartphone, Lock, Gift, UserPlus, LogIn, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeAuthModal, closeAuthModal, login, register, adminSettings } = useGaming();

  const [mode, setMode] = useState<'login' | 'register'>(activeAuthModal || 'login');
  const [phone, setPhone] = useState('9876543210');
  const [pin, setPin] = useState('1234');
  const [referralCode, setReferralCode] = useState('COME888');
  const [error, setError] = useState<string | null>(null);

  if (!activeAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (mode === 'login') {
      const ok = login(phone, pin);
      if (!ok) {
        setError('Login failed. Please check your credentials.');
      }
    } else {
      const ok = register(phone, pin, referralCode);
      if (!ok) {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-[#121929] border border-cyan-800/60 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#172238] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎰</span>
            <span className="font-gaming font-black text-lg text-white">
              {mode === 'login' ? 'LOGIN TO COMEPLAY' : 'CREATE ACCOUNT'}
            </span>
          </div>
          <button onClick={closeAuthModal} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bonus notification banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 px-4 py-2 border-b border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Get ₹100 Welcome Bonus + ₹{adminSettings.referralBonus} on Referral!</span>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-3 py-2 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Mobile input */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Password / PIN input */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
              Secret PIN / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter password or 4-digit PIN"
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Referral Code (in register mode) */}
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. COME888"
                  className="w-full bg-[#0a0f1d] border border-amber-500/40 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95"
          >
            {mode === 'login' ? 'SIGN IN NOW' : 'CREATE ACCOUNT & CLAIM ₹100'}
          </button>

          {/* Demo account quick login helper */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                login('9876543210', '1234');
              }}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              ⚡ Quick 1-Tap Demo Login (Player 9876 with ₹1,540)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
