import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { Activity, Flame, Trophy } from 'lucide-react';

export const LiveBetsFeed: React.FC = () => {
  const { liveBets, openGame } = useGaming();
  const [subTab, setSubTab] = useState<'casino' | 'race'>('casino');

  return (
    <div className="bg-[#111827]/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="font-gaming text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Bets
          </h3>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 flex text-xs">
          <button
            onClick={() => setSubTab('casino')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              subTab === 'casino'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Casino
          </button>
          <button
            onClick={() => setSubTab('race')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              subTab === 'race'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ₹30L Race
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-12 text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1.5 px-2 border-b border-slate-800">
        <div className="col-span-5">Game</div>
        <div className="col-span-4 text-center">Player</div>
        <div className="col-span-3 text-right">Payout</div>
      </div>

      {/* List items */}
      <div className="divide-y divide-slate-800/40 max-h-[280px] overflow-y-auto no-scrollbar">
        {liveBets.slice(0, 7).map((item) => (
          <div
            key={item.id}
            onClick={() => {
              const lower = item.game.toLowerCase();
              if (lower.includes('aviator')) openGame('aviator');
              else if (lower.includes('mines')) openGame('mines');
              else if (lower.includes('7 up')) openGame('7up-7down');
            }}
            className="grid grid-cols-12 items-center py-2 px-2 text-xs hover:bg-slate-800/40 cursor-pointer rounded-lg transition"
          >
            <div className="col-span-5 flex items-center gap-2 truncate">
              <span className="text-sm">{item.icon || '🎮'}</span>
              <span className="font-semibold text-gray-200 truncate">{item.game}</span>
            </div>
            <div className="col-span-4 text-center text-gray-400 truncate text-[11px]">
              {item.player}
            </div>
            <div className="col-span-3 text-right font-mono-num font-bold text-emerald-400 flex items-center justify-end gap-0.5">
              <span>{item.payout.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-500">₹</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
