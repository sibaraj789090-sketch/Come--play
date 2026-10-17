import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import confetti from 'canvas-confetti';
import { Dices, X, RotateCcw } from 'lucide-react';

export const SevenUpDownGame: React.FC = () => {
  const { currentUser, placeBet, settleBet, closeGame, showToast } = useGaming();

  const [selectedSide, setSelectedSide] = useState<'DOWN' | 'SEVEN' | 'UP'>('DOWN');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [dice1, setDice1] = useState<number>(3);
  const [dice2, setDice2] = useState<number>(4);
  const [lastResult, setLastResult] = useState<{ total: number; won: boolean; winAmount: number } | null>(null);

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const rollDice = () => {
    if (!currentUser || isRolling) return;
    if (currentUser.balance < betAmount) {
      showToast('Insufficient cash balance. Please deposit to roll.');
      return;
    }

    const multiplier = selectedSide === 'SEVEN' ? 5.0 : 2.0;

    const betId = placeBet({
      gameId: '7up-7down',
      gameName: '7 Up 7 Down',
      amount: betAmount,
      multiplier,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `7 Up 7 Down: ${selectedSide} (@ ${multiplier}x), ₹${betAmount}`,
    });

    if (!betId) return;

    setIsRolling(true);
    setLastResult(null);

    // Roll animation
    let count = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 12) {
        clearInterval(interval);

        // Final result
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;

        setDice1(d1);
        setDice2(d2);
        setIsRolling(false);

        let won = false;
        if (selectedSide === 'DOWN' && total < 7) won = true;
        else if (selectedSide === 'SEVEN' && total === 7) won = true;
        else if (selectedSide === 'UP' && total > 7) won = true;

        const payout = won ? parseFloat((betAmount * multiplier).toFixed(2)) : 0;
        setLastResult({ total, won, winAmount: payout });
        settleBet(betId, won, multiplier);

        if (won) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3">
      <div className="w-full max-w-md bg-[#0e1422] border border-pink-900/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#141b2c] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎲</span>
            <span className="font-gaming font-black text-lg text-white tracking-wider">
              7 UP 7 DOWN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-pink-300 font-bold">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </span>
            <button onClick={closeGame} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dice Arena */}
        <div className="p-6 bg-gradient-to-b from-[#0a0f1b] to-[#121929] flex flex-col items-center justify-center">
          <div className="flex items-center gap-6 my-4">
            <div
              className={`w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center text-5xl shadow-2xl border-4 border-slate-300 text-rose-600 transition-transform ${
                isRolling ? 'rotate-180 scale-110' : ''
              }`}
            >
              {diceFaces[dice1 - 1]}
            </div>
            <div
              className={`w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center text-5xl shadow-2xl border-4 border-slate-300 text-slate-900 transition-transform ${
                isRolling ? '-rotate-180 scale-110' : ''
              }`}
            >
              {diceFaces[dice2 - 1]}
            </div>
          </div>

          <div className="text-sm font-bold text-gray-400">
            Total: <span className="text-xl text-white font-mono-num font-black">{dice1 + dice2}</span>
          </div>

          {lastResult && (
            <div
              className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold animate-in zoom-in-95 ${
                lastResult.won
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {lastResult.won ? `You Won ₹${lastResult.winAmount}!` : 'Round Lost. Try again!'}
            </div>
          )}
        </div>

        {/* Betting options */}
        <div className="p-4 bg-[#111828] border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedSide('DOWN')}
              className={`p-3 rounded-xl border text-center transition ${
                selectedSide === 'DOWN'
                  ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-md scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-sm">7 DOWN</div>
              <div className="text-[10px] text-gray-400">2 to 6</div>
              <div className="text-xs font-mono-num font-black text-amber-400 mt-1">2.0X</div>
            </button>

            <button
              onClick={() => setSelectedSide('SEVEN')}
              className={`p-3 rounded-xl border text-center transition ${
                selectedSide === 'SEVEN'
                  ? 'bg-red-600/30 border-red-400 text-red-300 shadow-md scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-sm text-amber-300">LUCKY 7</div>
              <div className="text-[10px] text-gray-400">Exact 7</div>
              <div className="text-xs font-mono-num font-black text-amber-400 mt-1">5.0X</div>
            </button>

            <button
              onClick={() => setSelectedSide('UP')}
              className={`p-3 rounded-xl border text-center transition ${
                selectedSide === 'UP'
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-md scale-[1.02]'
                  : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-sm">7 UP</div>
              <div className="text-[10px] text-gray-400">8 to 12</div>
              <div className="text-xs font-mono-num font-black text-amber-400 mt-1">2.0X</div>
            </button>
          </div>

          {/* Quick Amounts */}
          <div className="flex items-center gap-2">
            {[20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`flex-1 py-1 rounded text-xs font-bold transition ${
                  betAmount === amt
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-900 text-gray-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <button
            disabled={isRolling}
            onClick={rollDice}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(236,72,153,0.4)] active:scale-95 disabled:opacity-50"
          >
            {isRolling ? 'ROLLING...' : `ROLL DICE (₹${betAmount})`}
          </button>
        </div>
      </div>
    </div>
  );
};
