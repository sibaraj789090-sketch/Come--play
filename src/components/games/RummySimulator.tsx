import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import confetti from 'canvas-confetti';
import { X, Play, RefreshCw, Trophy, AlertCircle } from 'lucide-react';

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  color: 'red' | 'black';
}

export const RummySimulator: React.FC = () => {
  const { currentUser, placeBet, settleBet, closeGame, showToast } = useGaming();

  const [entryFee, setEntryFee] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasDeclared, setHasDeclared] = useState<boolean>(false);
  const [betId, setBetId] = useState<string | null>(null);

  // 13 cards
  const [hand, setHand] = useState<Card[]>([
    { id: '1', suit: '♠', value: 'A', color: 'black' },
    { id: '2', suit: '♠', value: '2', color: 'black' },
    { id: '3', suit: '♠', value: '3', color: 'black' },
    { id: '4', suit: '♥', value: 'K', color: 'red' },
    { id: '5', suit: '♥', value: 'Q', color: 'red' },
    { id: '6', suit: '♥', value: 'J', color: 'red' },
    { id: '7', suit: '♦', value: '10', color: 'red' },
    { id: '8', suit: '♦', value: '10', color: 'red' },
    { id: '9', suit: '♣', value: '10', color: 'black' },
    { id: '10', suit: '♣', value: '7', color: 'black' },
    { id: '11', suit: '♣', value: '8', color: 'black' },
    { id: '12', suit: '♣', value: '9', color: 'black' },
    { id: '13', suit: '♥', value: 'JOKER', color: 'red' },
  ]);

  const startTable = () => {
    if (!currentUser) return;
    if (currentUser.balance < entryFee) {
      showToast('Insufficient cash balance to join this table.');
      return;
    }

    const id = placeBet({
      gameId: 'rummy',
      gameName: 'Rummy 2P Table',
      amount: entryFee,
      multiplier: 1.9,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `Rummy 2P: Entry ₹${entryFee}`,
    });

    if (!id) return;
    setBetId(id);
    setIsPlaying(true);
    setHasDeclared(false);
  };

  const handleDeclare = () => {
    if (!isPlaying || !betId) return;
    setHasDeclared(true);
    setIsPlaying(false);
    settleBet(betId, true, 1.9);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3">
      <div className="w-full max-w-2xl bg-[#0d1624] border border-rose-900/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#152238] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎴</span>
            <span className="font-gaming font-black text-lg text-white tracking-wider">
              COME RUMMY ARENA (2P TABLE)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-rose-300 font-bold">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </span>
            <button onClick={closeGame} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Felt green table */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0b331f] via-[#082818] to-[#04170d] flex flex-col items-center justify-between min-h-[320px] relative">
          {/* Opponent representation */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/30 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Opponent: User6829 (₹95.00 Pot)</span>
          </div>

          {/* Center Table: Closed Deck & Open Card */}
          <div className="flex items-center gap-6 my-4">
            {/* Closed deck */}
            <div className="w-14 h-20 bg-gradient-to-br from-blue-900 to-indigo-950 rounded-lg border-2 border-slate-400 flex items-center justify-center shadow-lg transform -rotate-3">
              <span className="text-xs text-white font-bold">DECK</span>
            </div>
            {/* Open card / Wild Joker */}
            <div className="w-14 h-20 bg-white rounded-lg border-2 border-amber-400 flex flex-col items-center justify-center shadow-lg transform rotate-3">
              <span className="text-xs font-bold text-red-600">Q ♥</span>
              <span className="text-[9px] font-bold text-amber-600">JOKER</span>
            </div>
          </div>

          {/* User's 13 Hand Cards */}
          <div className="w-full">
            <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Your Cards (Pure Seq + Impure + Sets)</span>
              <span className="text-amber-400">0 Points (Valid Show)</span>
            </div>

            <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-2 gap-1 sm:gap-1.5">
              {hand.map((card) => (
                <div
                  key={card.id}
                  className={`w-9 sm:w-11 h-14 sm:h-16 bg-white rounded-md border border-gray-300 flex flex-col items-center justify-between p-1 shadow-md transition-transform hover:-translate-y-2 select-none flex-shrink-0 ${
                    card.color === 'red' ? 'text-red-600' : 'text-slate-950'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs font-black leading-none">
                    {card.value}
                  </span>
                  <span className="text-base sm:text-lg leading-none">{card.suit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#111929] border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Entry:</span>
            {[25, 50, 100, 250].map((amt) => (
              <button
                key={amt}
                disabled={isPlaying}
                onClick={() => setEntryFee(amt)}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  entryFee === amt
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white disabled:opacity-50'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div>
            {isPlaying ? (
              <button
                onClick={handleDeclare}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-95"
              >
                DECLARE & SHOW (WIN ₹{(entryFee * 1.9).toFixed(2)})
              </button>
            ) : hasDeclared ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  🎉 Valid Show! Won ₹{(entryFee * 1.9).toFixed(2)}
                </span>
                <button
                  onClick={startTable}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <button
                onClick={startTable}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-95"
              >
                JOIN TABLE (₹{entryFee})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
