import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, CheckCircle, Trophy } from 'lucide-react';

export const SportsBetModal: React.FC = () => {
  const { sportsSlip, closeSportsSlip, placeBet, currentUser, showToast } = useGaming();
  const [stake, setStake] = useState<number>(100);
  const [placed, setPlaced] = useState(false);

  if (!sportsSlip) return null;

  const { match, selection, odds, type } = sportsSlip;
  const potentialReturn = parseFloat((stake * odds).toFixed(2));
  const potentialProfit = parseFloat((potentialReturn - stake).toFixed(2));

  const handlePlaceBet = () => {
    if (!currentUser) return;
    if (currentUser.balance < stake) {
      showToast('Insufficient balance to place bet. Please deposit cash.');
      return;
    }

    const betId = placeBet({
      gameId: match.id,
      gameName: `${match.teamA} vs ${match.teamB}`,
      amount: stake,
      multiplier: odds,
      payout: 0,
      status: 'PENDING',
      betType: 'sports',
      details: `${type.toUpperCase()}: ${selection} (@ ${odds}x odds) · ${match.tournament}`,
    });

    if (betId) {
      setPlaced(true);
      setTimeout(() => {
        setPlaced(false);
        closeSportsSlip();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3">
      <div className="w-full max-w-sm bg-[#12192a] border border-cyan-800/80 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="bg-[#17223b] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs sm:text-sm text-white uppercase tracking-wide">
              Bet Slip · {type.toUpperCase()}
            </span>
          </div>
          <button onClick={closeSportsSlip} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {placed ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="text-base font-bold text-white">Bet Placed Successfully!</h4>
            <p className="text-xs text-gray-300">
              Good luck! You can track this in <strong className="text-cyan-400">My Bets</strong>.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3.5">
            {/* Selection info */}
            <div className="bg-[#0b101d] p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-gray-400 truncate mb-1">
                {match.format} · {match.tournament}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{selection}</span>
                <span className="font-mono-num font-black text-cyan-400 text-sm bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  {odds.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Stake Input & Preset pills */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Enter Stake (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  value={stake}
                  onChange={(e) => setStake(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-1.5 mt-2">
                {[50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStake(amt)}
                    className={`flex-1 py-1 rounded text-xs font-bold transition ${
                      stake === amt
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-900 text-gray-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Returns summary */}
            <div className="bg-[#0b101c] p-2.5 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Potential Profit:</span>
                <span className="font-bold text-emerald-400 font-mono-num">+₹{potentialProfit}</span>
              </div>
              <div className="flex justify-between text-gray-300 font-bold border-t border-slate-800 pt-1">
                <span>Total Payout:</span>
                <span className="text-cyan-400 font-mono-num text-sm">₹{potentialReturn}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceBet}
              className="w-full py-3 bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-300 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95"
            >
              PLACE BET (₹{stake})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
