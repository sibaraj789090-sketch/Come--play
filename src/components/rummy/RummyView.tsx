import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { INITIAL_RUMMY_TABLES } from '../../data/mockData';
import { Layers, Users, Play, Sparkles } from 'lucide-react';

export const RummyView: React.FC = () => {
  const { openGame, currentUser } = useGaming();
  const [activeType, setActiveType] = useState<'POINTS' | 'DEALS' | 'POOL'>('DEALS');
  const [playersCount, setPlayersCount] = useState<'2P' | '6P'>('2P');

  const filteredTables = INITIAL_RUMMY_TABLES.filter((t) => t.type === activeType);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Rummy Brand Header matching screenshot #8 */}
      <div className="bg-[#121929] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-4 border-b border-red-900/40 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🃏</span>
            <span className="font-black text-xl tracking-tight text-white font-gaming">
              COME RUMMY
            </span>
          </div>
          <p className="text-xs text-rose-300 mt-0.5">
            100% Legal Skill Gaming with Instant UPI Cashout
          </p>
        </div>

        {/* Subtabs: Points, Deals, Pool */}
        <div className="flex border-b border-slate-800 text-xs font-bold">
          {(['POINTS', 'DEALS', 'POOL'] as const).map((tab) => {
            const active = activeType === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveType(tab)}
                className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                  active
                    ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{tab}</span>
              </button>
            );
          })}
        </div>

        {/* 2P vs 6P switcher and balance */}
        <div className="p-3 bg-[#0c1220] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {(['2P', '6P'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlayersCount(p)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  playersCount === p
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="text-gray-300 font-mono-num flex items-center gap-1 font-bold">
            <span className="text-gray-500">Balance:</span>
            <span className="text-emerald-400">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Table items matching screenshot #8 */}
        <div className="p-3 space-y-2.5">
          {filteredTables.map((tbl) => (
            <div
              key={tbl.id}
              className="bg-[#162035] hover:bg-[#1a2742] border border-slate-700/60 rounded-xl p-3 flex items-center justify-between transition shadow-sm"
            >
              <div>
                <div className="font-black text-sm text-white font-mono-num">
                  Entry: ₹{tbl.entryFee}
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold text-[10px]">
                    {playersCount === '2P' ? '2 Deals' : '6 Deals'}
                  </span>
                  <span>Prize: ₹{tbl.prize}</span>
                </div>
              </div>

              <button
                onClick={() => openGame('rummy-sim')}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs shadow-md transition active:scale-95 flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Now</span>
              </button>
            </div>
          ))}
        </div>

        {/* Online players counter matching screenshot #8 */}
        <div className="bg-[#0b0f19] px-4 py-2 border-t border-slate-800 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online: 1,515 players in lobby</span>
        </div>
      </div>
    </div>
  );
};
