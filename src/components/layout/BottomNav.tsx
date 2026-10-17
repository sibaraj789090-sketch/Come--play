import React from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  Crown,
  Users,
  Trophy,
  Tag,
  Home,
  ReceiptText,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { GameCategory } from '../../types/gaming';

interface BottomNavProps {
  currentTab: GameCategory;
  onTabChange: (tab: GameCategory) => void;
  onOpenMyBets: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenMyBets,
}) => {
  const { openReferral, setIsAdminView, isAdminView, userBets, openWallet, currentUser } = useGaming();

  const pendingBetsCount = userBets.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c1220]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 safe-bottom sm:hidden">
      <div className="flex items-center justify-around text-[10px] font-medium text-gray-400">
        {/* Home */}
        <button
          onClick={() => {
            setIsAdminView(false);
            onTabChange('explore');
          }}
          className={`flex flex-col items-center py-1 transition ${
            !isAdminView && currentTab === 'explore' ? 'text-cyan-400 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        {/* Casino */}
        <button
          onClick={() => {
            setIsAdminView(false);
            onTabChange('casino');
          }}
          className={`flex flex-col items-center py-1 transition ${
            !isAdminView && currentTab === 'casino' ? 'text-cyan-400 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <Crown className="w-5 h-5 mb-0.5 text-amber-400" />
          <span>Slots</span>
        </button>

        {/* User Wallet & Cashout */}
        <button
          onClick={openWallet}
          className="flex flex-col items-center py-1 text-emerald-400 hover:text-emerald-300 transition"
          title="User Wallet & Withdrawal"
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="font-bold">
            {currentUser ? `₹${Math.floor(currentUser.balance)}` : 'Wallet'}
          </span>
        </button>

        {/* Earn (Referral) */}
        <button
          onClick={openReferral}
          className="flex flex-col items-center py-1 hover:text-amber-300 transition text-amber-400"
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Earn ₹110</span>
        </button>

        {/* My Bets */}
        <button
          onClick={onOpenMyBets}
          className="flex flex-col items-center py-1 relative hover:text-gray-200 transition"
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span>My Bets</span>
          {pendingBetsCount > 0 && (
            <span className="absolute -top-0.5 right-2 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
              {pendingBetsCount}
            </span>
          )}
        </button>

        {/* Admin or Promos */}
        <button
          onClick={() => setIsAdminView(!isAdminView)}
          className={`flex flex-col items-center py-1 transition ${
            isAdminView ? 'text-amber-400 font-bold' : 'hover:text-gray-200'
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-0.5" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};
