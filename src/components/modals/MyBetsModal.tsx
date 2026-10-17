import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, ReceiptText, Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const MyBetsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { userBets } = useGaming();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST'>('ALL');

  if (!isOpen) return null;

  const filtered = userBets.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-lg bg-[#111828] border border-cyan-900/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#172238] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-cyan-400" />
            <span className="font-gaming font-black text-lg text-white">
              MY BETS HISTORY
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex border-b border-slate-800 text-xs font-bold bg-[#0c1220]">
          {(['ALL', 'PENDING', 'WON', 'LOST'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2.5 text-center transition border-b-2 ${
                filter === tab
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List of bets */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-2.5 divide-y divide-slate-800/40">
          {filtered.length > 0 ? (
            filtered.map((bet) => (
              <div
                key={bet.id}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-100 truncate">{bet.gameName}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                        bet.status === 'WON'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : bet.status === 'LOST'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {bet.status}
                    </span>
                  </div>
                  {bet.details && (
                    <div className="text-[11px] text-gray-400 truncate mt-0.5">{bet.details}</div>
                  )}
                  <div className="text-[10px] text-gray-500 mt-0.5">{bet.createdAt}</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono-num text-gray-400">
                    Stake: <span className="font-bold text-gray-200">₹{bet.amount}</span>
                  </div>
                  <div
                    className={`font-mono-num font-bold text-sm ${
                      bet.status === 'WON'
                        ? 'text-emerald-400'
                        : bet.status === 'LOST'
                        ? 'text-rose-500'
                        : 'text-amber-400'
                    }`}
                  >
                    {bet.status === 'WON'
                      ? `+₹${bet.payout.toFixed(2)}`
                      : bet.status === 'LOST'
                      ? `-₹${bet.amount}`
                      : `${bet.multiplier.toFixed(2)}x`}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              No {filter.toLowerCase()} bets found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
