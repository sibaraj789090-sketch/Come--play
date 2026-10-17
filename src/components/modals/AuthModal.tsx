import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, Smartphone, Mail, Lock, Gift, UserPlus, LogIn, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeAuthModal, closeAuthModal, login, register, quickGoogleLogin, adminSettings } = useGaming();

  const [mode, setMode] = useState<'login' | 'register'>(activeAuthModal || 'login');
  const [authChannel, setAuthChannel] = useState<'mobile' | 'gmail'>('mobile');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('ladandas22@gmail.com');
  const [pin, setPin] = useState('1234');
  const [referralCode, setReferralCode] = useState('COME888');
  const [error, setError] = useState<string | null>(null);

  if (!activeAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = authChannel === 'mobile' ? phone.trim() : email.trim();

    if (authChannel === 'mobile') {
      if (phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
    } else {
      if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid Gmail / Email address');
        return;
      }
    }

    if (mode === 'login') {
      const ok = login(identifier, pin);
      if (!ok) {
        setError('Login failed. Please check your credentials.');
      }
    } else {
      const ok = register(identifier, pin, referralCode);
      if (!ok) {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const handleGoogleQuickAuth = (userEmail = 'ladandas22@gmail.com') => {
    setError(null);
    quickGoogleLogin(userEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#121929] border border-cyan-800/60 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-[#172238] px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎰</span>
            <span className="font-gaming font-black text-lg text-white">
              {mode === 'login' ? 'LOGIN TO COMEPLAY' : 'CREATE FREE ACCOUNT'}
            </span>
          </div>
          <button onClick={closeAuthModal} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero OTP Verification Guarantee Badge */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-xs flex items-center justify-between text-emerald-300">
          <div className="flex items-center gap-1.5 font-bold">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 flex-shrink-0 animate-pulse" />
            <span>Instant Login — NO OTP Required!</span>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-500/40">
            100% DIRECT
          </span>
        </div>

        {/* Bonus notification banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 px-4 py-1.5 border-b border-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>₹100 Welcome Bonus instantly credited upon entering!</span>
        </div>

        {/* Tab switch: Login vs Register */}
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
            <span>Sign In</span>
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
            <span>Register (Free ₹100)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-3 py-2 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick 1-Tap Google / Gmail Sign In */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleGoogleQuickAuth('ladandas22@gmail.com')}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2.5 shadow-md border border-slate-300 active:scale-95 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>1-Tap Instant Sign in with Google</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black border border-emerald-200">
                No OTP
              </span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-[#121929] px-3 text-[11px] font-bold text-gray-500 uppercase">
              Or Choose Login Method
            </span>
            <div className="border-t border-slate-800 w-full"></div>
          </div>

          {/* Channel selector: Mobile vs Gmail */}
          <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthChannel('mobile');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                authChannel === 'mobile'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile Number</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthChannel('gmail');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                authChannel === 'gmail'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Gmail / Email</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authChannel === 'mobile' ? (
              /* Mobile input */
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-300 uppercase">
                    10-Digit Mobile Number
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> No OTP verification needed
                  </span>
                </div>
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
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 font-mono-num"
                  />
                </div>
              </div>
            ) : (
              /* Gmail input */
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-300 uppercase">
                    Gmail / Email Address
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Direct Login (No OTP)
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Password / PIN input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-gray-300 uppercase">
                  Password / PIN
                </label>
                <span className="text-[10px] text-gray-400">Default: 1234</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
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
                <p className="text-[10px] text-amber-400/80 mt-1">
                  Enter referral code to receive an extra ₹{adminSettings.referralBonus} bonus!
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-1.5"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>DIRECT SIGN IN NOW (NO OTP)</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>INSTANT REGISTER & CLAIM ₹100</span>
                </>
              )}
            </button>

            {/* Quick Demo profiles */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2 text-center">
                Instant Quick Profiles (1-Click Login):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => login('9876543210', '1234')}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition"
                >
                  <div className="text-cyan-400 font-bold truncate">📱 9876543210</div>
                  <div className="text-[10px] text-gray-400">Player 9876 (₹1,540)</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickGoogleLogin('ladandas22@gmail.com', 'Ladan Das')}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left transition"
                >
                  <div className="text-amber-400 font-bold truncate">✉️ ladandas22@gmail.com</div>
                  <div className="text-[10px] text-gray-400">Ladan Das (₹2,500)</div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
