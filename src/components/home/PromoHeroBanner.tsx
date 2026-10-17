import React from 'react';
import { useGaming } from '../../context/GamingContext';
import { Gift, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { LEADERBOARD_PAYOUTS } from '../../data/mockData';

export const PromoHeroBanner: React.FC = () => {
  const { openReferral, openAuthModal, currentUser, adminSettings } = useGaming();

  return (
    <div className="space-y-4">
      {/* Main Hero Referral Banner matching Screenshot #5 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a0826] via-[#2d0e3a] to-[#0c1833] border border-fuchsia-900/50 p-4 sm:p-6 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SPECIAL REFERRAL REWARD</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-white font-gaming tracking-tight">
              FRIEND REGISTERS <br className="hidden sm:inline" />
              <span className="gold-gradient-text text-2xl sm:text-3xl md:text-4xl">
                YOU EARN ₹{adminSettings.referralBonus}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-md">
              Share your referral link on WhatsApp or Telegram. Get instant cash bonus when your friends register and make their first bet!
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <button
                onClick={currentUser ? openReferral : () => openAuthModal('register')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>{currentUser ? 'Invite Now & Earn' : 'Login / Register to Earn'}</span>
              </button>

              <button
                onClick={openReferral}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                Rules & T&C
              </button>
            </div>
          </div>

          {/* Reward Badges Mockup Graphic */}
          <div className="flex items-center gap-3 bg-[#131b2e]/80 border border-amber-500/30 p-3 rounded-2xl backdrop-blur-sm shadow-xl">
            <div className="text-center p-2 rounded-xl bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-500/30">
              <div className="text-lg font-black text-amber-400">₹80</div>
              <div className="text-[10px] text-gray-300">Registration</div>
            </div>
            <div className="text-lg font-bold text-gray-500">+</div>
            <div className="text-center p-2 rounded-xl bg-gradient-to-b from-emerald-500/20 to-transparent border border-emerald-500/30">
              <div className="text-lg font-black text-emerald-400">₹30</div>
              <div className="text-[10px] text-gray-300">First Play</div>
            </div>
            <div className="text-lg font-bold text-gray-500">=</div>
            <div className="text-center p-2 rounded-xl bg-gradient-to-b from-cyan-500/20 to-transparent border border-cyan-500/30">
              <div className="text-xl font-black text-cyan-400">₹110</div>
              <div className="text-[10px] text-cyan-200 font-bold">Total Cash</div>
            </div>
          </div>
        </div>
      </div>

      {/* IPL Verified Payout Records matching Screenshot #2 */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#091b33] to-[#0d1627] border border-cyan-900/40 p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
              COME TO WIN!
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white font-gaming mt-0.5">
              INDIAN PREMIER LEAGUE
            </h3>
            <div className="text-xs text-gray-400 mt-0.5">
              TOTAL VERIFIED PAYOUT
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono-num drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              ₹497 Cr+ <span className="text-xs font-bold text-gray-300">PAID OUT</span>
            </div>
          </div>

          {/* Leaderboard records */}
          <div className="w-full md:w-auto flex-1 max-w-lg space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 text-center md:text-left flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Payout Records
            </div>
            <div className="space-y-1.5">
              {LEADERBOARD_PAYOUTS.map((rec) => (
                <div
                  key={rec.rank}
                  className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        rec.rank === 1
                          ? 'bg-amber-400 text-black'
                          : rec.rank === 2
                          ? 'bg-slate-300 text-black'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {rec.rank}
                    </span>
                    <span className="text-gray-300 font-medium">User: {rec.user}</span>
                    <span className="text-[10px] text-gray-500 hidden sm:inline">({rec.match})</span>
                  </div>
                  <span className="font-mono-num font-bold text-amber-400">{rec.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Gaming Notice matching Screenshot #2 */}
      <div className="rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-blue-950/40 border border-cyan-800/40 px-4 py-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Responsible Gaming
            </div>
            <div className="text-gray-300 font-medium text-xs">
              Gaming is for fun, not for regular income. Play responsibly. (18+)
            </div>
          </div>
        </div>

        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
          100% Certified
        </span>
      </div>
    </div>
  );
};
