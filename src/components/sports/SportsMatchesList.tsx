import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { Search, Radio, Clock, AlertCircle } from 'lucide-react';
import { SportsMatch } from '../../types/gaming';

export const SportsMatchesList: React.FC = () => {
  const { sportsMatches, openSportsSlip } = useGaming();
  const [betTypeMode, setBetTypeMode] = useState<'Fancy' | 'Fixed'>('Fixed');
  const [timeFilter, setTimeFilter] = useState<'In-Play' | 'Today' | 'Early' | 'Champion'>('Today');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = sportsMatches.filter((match) => {
    const matchesSearch =
      match.teamA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.teamB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.tournament.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (timeFilter === 'In-Play') return match.status === 'IN-PLAY';
    if (timeFilter === 'Today') return match.status === 'TODAY' || match.status === 'IN-PLAY';
    if (timeFilter === 'Early') return match.status === 'EARLY';
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Fancy / Fixed toggle bar matching screenshot #7 */}
      <div className="bg-[#101726] p-1 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex-1 flex gap-1">
          <button
            onClick={() => setBetTypeMode('Fancy')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              betTypeMode === 'Fancy'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fancy
          </button>
          <button
            onClick={() => setBetTypeMode('Fixed')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              betTypeMode === 'Fixed'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fixed Odds
          </button>
        </div>
      </div>

      {/* Time filters matching screenshot #7 */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['In-Play', 'Today', 'Early', 'Champion'] as const).map((filter) => {
          const active = timeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                active
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter === 'In-Play' && <Radio className="w-3 h-3 inline mr-1 text-red-500 animate-pulse" />}
              {filter}
            </button>
          );
        })}
      </div>

      {/* Match cards list */}
      <div className="space-y-2.5">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="bg-[#121929] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition shadow-md"
          >
            {/* Tournament header */}
            <div className="bg-[#0b101c] px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold truncate text-cyan-400">
                {match.format} · {match.tournament}
              </span>
              <div className="flex items-center gap-1.5">
                {match.status === 'IN-PLAY' ? (
                  <span className="bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    IN-PLAY
                  </span>
                ) : (
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {match.startTime}
                  </span>
                )}
              </div>
            </div>

            {/* Match Teams and Odds row */}
            <div className="p-3 space-y-2.5">
              {/* Team A */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 truncate">
                  <span className="text-lg">{match.flagA}</span>
                  <div className="truncate">
                    <span className="font-bold text-xs sm:text-sm text-gray-100 truncate block">
                      {match.teamA}
                    </span>
                    {match.scoreA && (
                      <span className="text-[11px] font-mono-num text-amber-400 font-bold">
                        {match.scoreA}
                      </span>
                    )}
                  </div>
                </div>

                {/* Odds Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    disabled={match.isSuspended}
                    onClick={() =>
                      openSportsSlip({
                        match,
                        selection: match.teamA,
                        odds: match.backOddsA,
                        type: 'back',
                      })
                    }
                    className={`w-16 sm:w-20 py-1.5 rounded-lg text-xs font-mono-num font-bold text-center transition ${
                      match.isSuspended
                        ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                        : 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-sm active:scale-95'
                    }`}
                  >
                    {match.isSuspended ? (
                      <span className="text-[10px] text-red-400 uppercase">Suspended</span>
                    ) : (
                      <>
                        <div className="text-[9px] uppercase font-sans text-sky-950 font-bold">Back</div>
                        <div>{match.backOddsA.toFixed(2)}</div>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Team B */}
              <div className="flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2">
                <div className="flex items-center gap-2 flex-1 truncate">
                  <span className="text-lg">{match.flagB}</span>
                  <div className="truncate">
                    <span className="font-bold text-xs sm:text-sm text-gray-100 truncate block">
                      {match.teamB}
                    </span>
                    {match.scoreB && (
                      <span className="text-[11px] font-mono-num text-amber-400 font-bold">
                        {match.scoreB}
                      </span>
                    )}
                  </div>
                </div>

                {/* Odds Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    disabled={match.isSuspended}
                    onClick={() =>
                      openSportsSlip({
                        match,
                        selection: match.teamB,
                        odds: match.backOddsB,
                        type: 'back',
                      })
                    }
                    className={`w-16 sm:w-20 py-1.5 rounded-lg text-xs font-mono-num font-bold text-center transition ${
                      match.isSuspended
                        ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
                        : 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-sm active:scale-95'
                    }`}
                  >
                    {match.isSuspended ? (
                      <span className="text-[10px] text-red-400 uppercase">Suspended</span>
                    ) : (
                      <>
                        <div className="text-[9px] uppercase font-sans text-sky-950 font-bold">Back</div>
                        <div>{match.backOddsB.toFixed(2)}</div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
