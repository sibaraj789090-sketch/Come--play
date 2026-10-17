import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { Trophy, Flame, Clock, Users, Shield, Sparkles } from 'lucide-react';

export const FantasyView: React.FC = () => {
  const { sportsMatches, currentUser, placeBet, showToast } = useGaming();
  const [selectedSport, setSelectedSport] = useState<'Cricket' | 'Football'>('Cricket');
  const [joinedMatches, setJoinedMatches] = useState<string[]>([]);

  const handleJoinContest = (matchId: string, matchName: string, fee: number) => {
    if (!currentUser) return;
    if (currentUser.balance < fee) {
      showToast('Insufficient balance to join Mega Fantasy contest.');
      return;
    }

    const betId = placeBet({
      gameId: matchId,
      gameName: `Fantasy: ${matchName}`,
      amount: fee,
      multiplier: 3.5,
      payout: 0,
      status: 'PENDING',
      betType: 'fantasy',
      details: `Mega Contest 1st Prize ₹1 Crore (Fee ₹${fee})`,
    });

    if (betId) {
      setJoinedMatches((prev) => [...prev, matchId]);
      showToast(`Team Registered for ${matchName}! Good luck in the Mega Pool leaderboard!`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Fantasy Header */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/70 border border-red-900/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold mb-1">
            <Flame className="w-3.5 h-3.5" />
            MEGA FANTASY LEAGUES
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-gaming text-white uppercase">
            IPL & T20 CRICKET CONTESTS
          </h2>
          <p className="text-xs text-gray-300">
            Pick your 11 players, choose Captain (2X) & Vice Captain (1.5X) to win from crores!
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <div className="text-xs text-gray-400">Total Mega Pool</div>
          <div className="text-2xl font-black text-amber-400 font-mono-num">₹26.26M</div>
        </div>
      </div>

      {/* Sport switch */}
      <div className="flex border-b border-slate-800 text-xs sm:text-sm font-bold">
        {(['Cricket', 'Football'] as const).map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
              selectedSport === sport
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span>{sport === 'Cricket' ? '🏏' : '⚽'}</span>
            <span>{sport}</span>
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sportsMatches
          .filter((m) => m.category === selectedSport)
          .map((m) => {
            const isJoined = joinedMatches.includes(m.id);
            return (
              <div
                key={m.id}
                className="bg-[#121929] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition shadow-md flex flex-col justify-between"
              >
                {/* Header */}
                <div className="bg-[#0b101c] px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-cyan-400 truncate">{m.tournament}</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" /> {m.startTime}
                  </span>
                </div>

                {/* Teams & Prize Pool */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{m.flagA}</span>
                      <span className="font-bold text-sm text-white">{m.teamAShort}</span>
                    </div>

                    <div className="text-center px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-bold uppercase">
                      VS
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className="font-bold text-sm text-white">{m.teamBShort}</span>
                      <span className="text-2xl">{m.flagB}</span>
                    </div>
                  </div>

                  <div className="bg-[#0b101d] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Mega Pool:</span>
                      <span className="font-black text-amber-400 font-mono-num text-sm">
                        {m.prizePool || '₹2.62 Crores+'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Entry Fee:</span>
                      <span className="font-bold text-emerald-400 font-mono-num text-sm">₹49</span>
                    </div>
                  </div>
                </div>

                {/* Footer Join Button */}
                <div className="p-3 bg-[#0c1220] border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>84,920 Teams Joined</span>
                  </span>

                  <button
                    disabled={isJoined}
                    onClick={() => handleJoinContest(m.id, `${m.teamA} vs ${m.teamB}`, 49)}
                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                      isJoined
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white active:scale-95'
                    }`}
                  >
                    {isJoined ? 'Team Registered ✓' : 'Join Contest (₹49)'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
