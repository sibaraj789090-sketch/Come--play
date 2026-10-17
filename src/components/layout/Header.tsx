import React from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  Compass,
  Spade,
  Flame,
  Layers,
  Trophy,
  PlusCircle,
  User as UserIcon,
  Shield,
  Gift,
  Crown,
  LogOut,
  Wallet,
  ArrowDownCircle,
} from 'lucide-react';
import { GameCategory } from '../../types/gaming';

interface HeaderProps {
  currentTab: GameCategory;
  onTabChange: (tab: GameCategory) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const {
    currentUser,
    isAdmin,
    openAuthModal,
    logout,
    openDeposit,
    openWithdraw,
    openWallet,
    openReferral,
    setIsAdminView,
    isAdminView,
  } = useGaming();

  const navTabs: { id: GameCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'explore', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
    { id: 'casino', label: 'Casino & Slots', icon: <Spade className="w-4 h-4 text-amber-400" /> },
    { id: 'fantasy', label: 'Fantasy', icon: <Flame className="w-4 h-4" /> },
    { id: 'rummy', label: 'Rummy', icon: <Layers className="w-4 h-4" /> },
    { id: 'sports', label: 'Sports', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-[#0e1422] border-b border-slate-800/80 sticky top-0 z-30 shadow-lg">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsAdminView(false);
              onTabChange('explore');
            }}
            className="flex items-center gap-1.5 focus:outline-none group"
          >
            <div className="relative flex items-center">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white font-gaming drop-shadow-[0_2px_10px_rgba(6,182,212,0.6)]">
                Come
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded ml-1 border border-cyan-500/30">
                PLAY
              </span>
            </div>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin shortcut badge */}
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition border ${
              isAdminView
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-amber-500/30'
            }`}
            title="Admin Management Panel"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
            {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
          </button>

          {/* Reward chest & VIP */}
          <button
            onClick={openReferral}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 flex items-center gap-1 text-xs font-semibold transition"
            title="Refer & Earn ₹110"
          >
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="hidden md:inline font-bold">Earn ₹110</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Wallet & Balance Pill */}
              <button
                onClick={openWallet}
                className="flex items-center bg-[#151d30] hover:bg-[#1a253d] border border-cyan-500/40 rounded-full pl-2.5 pr-2 py-1 shadow-inner transition group"
                title="Open Wallet & Transaction History"
              >
                <Wallet className="w-3.5 h-3.5 text-cyan-400 mr-1.5 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col text-left mr-1 leading-none">
                  <span className="text-[9px] text-gray-400 font-medium">Wallet</span>
                  <span className="text-xs sm:text-sm font-bold text-white font-mono-num">
                    ₹{currentUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>

              {/* Deposit Quick Button */}
              <button
                onClick={openDeposit}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg px-2 sm:px-2.5 py-1 text-xs flex items-center gap-1 transition shadow-md active:scale-95"
                title="Deposit via UPI"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="font-bold hidden sm:inline">Deposit</span>
              </button>

              {/* Withdraw Quick Button */}
              <button
                onClick={openWithdraw}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 font-black rounded-lg px-2 sm:px-2.5 py-1 text-xs flex items-center gap-1 transition shadow-md active:scale-95"
                title="Withdraw Cash (No OTP)"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span className="font-bold hidden sm:inline">Withdraw</span>
              </button>

              {/* User menu & Profile */}
              <div className="flex items-center gap-1 pl-1">
                <button
                  onClick={openWallet}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white text-xs font-black shadow-md border border-cyan-400/40 hover:ring-2 hover:ring-cyan-400 transition"
                  title={`${currentUser.name} (${currentUser.phone ? '+91 ' + currentUser.phone : currentUser.email}) - Open Wallet`}
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </button>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-rose-400 p-1.5 rounded transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black rounded-lg text-xs sm:text-sm transition shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login / Sign Up</span>
                <span className="hidden sm:inline text-[9px] bg-slate-900/60 text-cyan-300 px-1 py-0.5 rounded font-mono">
                  No OTP
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main categories navigation row (Explore, Casino, Fantasy, Rummy, Sports) */}
      {!isAdminView && (
        <nav className="border-t border-slate-800/60 bg-[#0a0f1d] px-2 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-around sm:justify-start sm:gap-8 overflow-x-auto no-scrollbar py-1">
            {navTabs.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold transition border-b-2 ${
                    active
                      ? 'border-cyan-400 text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className={`${active ? 'text-cyan-400 scale-110' : 'text-gray-400'} transition-transform`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
