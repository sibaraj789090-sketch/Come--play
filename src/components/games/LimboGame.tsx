import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import confetti from 'canvas-confetti';
import { X, TrendingUp, Sparkles } from 'lucide-react';

export const LimboGame: React.FC = () => {
  const { currentUser, placeBet, settleBet, closeGame, showToast } = useGaming();

  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [resultMultiplier, setResultMultiplier] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);

  // Win Chance = (97 / targetMultiplier)%
  const winChance = Math.min(95, parseFloat((97 / targetMultiplier).toFixed(2)));

  const handleRoll = () => {
    if (!currentUser || isRolling) return;
    if (currentUser.balance < betAmount) {
      showToast('Insufficient cash balance. Please deposit to bet.');
      return;
    }

    const betId = placeBet({
      gameId: 'limbo',
      gameName: 'Limbo 1000X',
      amount: betAmount,
      multiplier: targetMultiplier,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `Limbo Target: ${targetMultiplier}x, Bet ₹${betAmount}`,
    });

    if (!betId) return;

    setIsRolling(true);
    setResultMultiplier(null);
    setWon(null);

    // Roll animation
    let count = 0;
    const interval = setInterval(() => {
      setResultMultiplier(parseFloat((1 + Math.random() * (targetMultiplier * 1.5)).toFixed(2)));
      count++;
      if (count > 8) {
        clearInterval(interval);

        // Generate final outcome
        const rand = Math.random() * 100;
        let finalOutcome: number;
        if (rand < winChance) {
          // Won!
          finalOutcome = parseFloat(
            (targetMultiplier + Math.random() * targetMultiplier * 0.8).toFixed(2)
          );
          setWon(true);
          settleBet(betId, true, targetMultiplier);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } else {
          // Lost!
          finalOutcome = parseFloat(
            (1.0 + Math.random() * (targetMultiplier - 1.05)).toFixed(2)
          );
          setWon(false);
          settleBet(betId, false);
        }

        setResultMultiplier(finalOutcome);
        setIsRolling(false);
      }
    }, 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3">
      <div className="w-full max-w-md bg-[#0e1422] border border-purple-900/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#151c2e] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="font-gaming font-black text-lg text-white">
              LIMBO 1000X ORIGINALS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-purple-300 font-bold">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </span>
            <button onClick={closeGame} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Target Display */}
        <div className="p-8 bg-gradient-to-b from-[#090e1a] to-[#121929] flex flex-col items-center justify-center text-center">
          <div
            className={`text-6xl font-black font-gaming tracking-tighter transition-all ${
              won === true
                ? 'text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.8)] scale-110'
                : won === false
                ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                : 'text-white'
            }`}
          >
            {resultMultiplier ? `${resultMultiplier.toFixed(2)}x` : `${targetMultiplier.toFixed(2)}x`}
          </div>

          <div className="text-xs text-gray-400 mt-2 font-medium">
            {won === true
              ? `You Won ₹${(betAmount * targetMultiplier).toFixed(2)}!`
              : won === false
              ? 'Below target. Better luck next roll!'
              : `Target to beat: > ${targetMultiplier.toFixed(2)}x`}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-[#111828] border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-gray-400 uppercase block mb-1">
                Target Multiplier
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="1000"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(Math.max(1.1, Number(e.target.value)))}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono-num text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  x
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-400 uppercase block mb-1">
                Win Probability
              </label>
              <div className="bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold font-mono-num text-cyan-400 text-center">
                {winChance}%
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              Bet Amount (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="5000"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold font-mono-num text-white"
              />
              <div className="flex gap-1">
                {[50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 text-gray-300 hover:bg-slate-700"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={isRolling}
            onClick={handleRoll}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95 disabled:opacity-50"
          >
            {isRolling ? 'ROLLING...' : `BET (PROFIT: ₹${(betAmount * targetMultiplier - betAmount).toFixed(0)})`}
          </button>
        </div>
      </div>
    </div>
  );
};
