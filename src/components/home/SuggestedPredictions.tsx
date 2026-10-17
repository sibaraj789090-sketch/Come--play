import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { TrendingUp, Check, X as XIcon, ChevronRight } from 'lucide-react';

export const SuggestedPredictions: React.FC = () => {
  const { predictions, placePredictionBet } = useGaming();
  const [selectedSport, setSelectedSport] = useState<'Cricket' | 'Football'>('Cricket');
  const [activeBettingId, setActiveBettingId] = useState<string | null>(null);
  const [choice, setChoice] = useState<'yes' | 'no'>('yes');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = predictions.filter((p) => p.category === selectedSport);

  const handleQuickBet = (predId: string, pick: 'yes' | 'no') => {
    setActiveBettingId(predId);
    setChoice(pick);
  };

  const confirmBet = (predId: string) => {
    const success = placePredictionBet(predId, choice, betAmount);
    if (success) {
      setToastMessage(`Bet placed on ${choice.toUpperCase()} for ₹${betAmount}!`);
      setTimeout(() => setToastMessage(null), 3000);
      setActiveBettingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
          Suggested Predictions
        </h3>
        <button className="text-xs text-gray-400 hover:text-cyan-400 flex items-center transition">
          View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Sport Selector */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setSelectedSport('Cricket')}
          className={`pb-2 px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition ${
            selectedSport === 'Cricket'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>🏏</span> Cricket
        </button>
        <button
          onClick={() => setSelectedSport('Football')}
          className={`pb-2 px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition ${
            selectedSport === 'Football'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>⚽</span> Football
        </button>
      </div>

      {/* Cards Horizontal Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#121826] border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition relative overflow-hidden shadow-md"
          >
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
              <span className="font-semibold text-cyan-400">{item.match}</span>
              {item.isTrending && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                  <TrendingUp className="w-2.5 h-2.5" /> Trending
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-gray-100 mb-3 leading-snug">
              {item.question}
            </p>

            {/* Voting / Betting Buttons */}
            {activeBettingId === item.id ? (
              <div className="bg-[#1a2336] p-2.5 rounded-lg border border-cyan-800/60 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300">
                    Bet on: <span className="uppercase text-amber-400">{choice}</span> (@{' '}
                    {choice === 'yes' ? item.yesOdds : item.noOdds}x)
                  </span>
                  <button
                    onClick={() => setActiveBettingId(null)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {[50, 100, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        betAmount === amt
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => confirmBet(item.id)}
                  className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold rounded text-xs shadow-md"
                >
                  Confirm Bet (Win: ₹
                  {(betAmount * (choice === 'yes' ? item.yesOdds : item.noOdds)).toFixed(0)})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickBet(item.id, 'yes')}
                  className="py-1.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Yes ({item.yesOdds}x)</span>
                </button>
                <button
                  onClick={() => handleQuickBet(item.id, 'no')}
                  className="py-1.5 px-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <XIcon className="w-3.5 h-3.5" />
                  <span>No ({item.noOdds}x)</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
