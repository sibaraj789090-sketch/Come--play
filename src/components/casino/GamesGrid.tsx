import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  Search,
  Flame,
  Sparkles,
  Zap,
  Play,
  Layers,
  Fish,
  Dice5,
  Gamepad2,
} from 'lucide-react';
import { INITIAL_GAMES } from '../../data/mockData';
import { GameItem } from '../../types/gaming';

interface GamesGridProps {
  forcedCategory?: string;
}

export const GamesGrid: React.FC<GamesGridProps> = ({ forcedCategory }) => {
  const { openGame, showToast } = useGaming();
  const [activeSubTab, setActiveSubTab] = useState<string>(forcedCategory || 'Lobby');
  const [searchQuery, setSearchQuery] = useState('');

  const subTabs = [
    { id: 'Lobby', label: 'Lobby', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'Originals', label: 'Originals – 99%RTP', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'Slots', label: 'Slots', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'Mini Game', label: 'Mini Game', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'Table Games', label: 'Table Games', icon: <Dice5 className="w-3.5 h-3.5" /> },
    { id: 'Fishing', label: 'Fishing', icon: <Fish className="w-3.5 h-3.5" /> },
    { id: 'Providers', label: 'Providers', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const filteredGames = INITIAL_GAMES.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.subtitle && game.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeSubTab === 'Lobby') return true;
    if (activeSubTab === 'Originals') return game.category === 'originals' || game.subCategory === 'originals';
    if (activeSubTab === 'Slots') return game.subCategory === 'slots';
    if (activeSubTab === 'Mini Game') return game.subCategory === 'mini-game' || game.category === 'mini-game';
    if (activeSubTab === 'Table Games') return game.subCategory === 'table';
    if (activeSubTab === 'Fishing') return game.category === 'fishing';
    return true;
  });

  const hotPicks = INITIAL_GAMES.filter((g) => g.tag === 'HOT');
  const originals = INITIAL_GAMES.filter((g) => g.category === 'originals' || g.tag === '99% RTP');

  const renderGameCard = (game: GameItem) => {
    return (
      <div
        key={game.id}
        onClick={() => {
          if (game.isPlayable) {
            openGame(game.id);
          } else {
            showToast(`${game.title} is currently syncing with provider servers. Try Aviator, Mines, 7 Up 7 Down, Dice, or Limbo!`);
          }
        }}
        className={`group relative rounded-xl p-3 flex flex-col justify-between overflow-hidden cursor-pointer border transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl bg-gradient-to-br ${game.bgGradient} border-slate-800 hover:border-cyan-500/60 aspect-[4/5]`}
      >
        {/* Glow overlay on hover */}
        <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          {game.tag ? (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm ${
                game.tag === 'HOT'
                  ? 'bg-rose-600 text-white'
                  : game.tag === 'NEW'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-cyan-500 text-slate-950 font-bold'
              }`}
            >
              {game.tag}
            </span>
          ) : <span />}

          <div className="flex items-center gap-1 text-[10px] text-gray-300 bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{game.playersCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Center Visual Art / Icon */}
        <div className="flex-1 flex flex-col items-center justify-center py-2 relative z-10">
          <div className="text-4xl sm:text-5xl drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform duration-300">
            {game.iconType === 'plane' && '✈️'}
            {game.iconType === 'chicken' && '🐔'}
            {game.iconType === 'gem' && '💎'}
            {game.iconType === 'eagle' && '🦅'}
            {game.iconType === 'dice' && '🎲'}
            {game.iconType === 'dices' && '🎲'}
            {game.iconType === 'diamond' && '💎'}
            {game.iconType === 'egg' && '🥚'}
            {game.iconType === 'dice-six' && '🎲'}
            {game.iconType === 'trending-up' && '📈'}
            {game.iconType === 'ticket' && '🎟️'}
            {game.iconType === 'rocket' && '🚀'}
            {game.iconType === 'swords' && '⚔️'}
            {game.iconType === 'spade' && '♠️'}
            {game.iconType === 'fish' && '🐟'}
          </div>

          {game.isPlayable && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] rounded-lg">
              <span className="w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </span>
            </div>
          )}
        </div>

        {/* Bottom Game Title & Subtitle */}
        <div className="z-10 text-center">
          <h4 className="font-gaming font-black text-xs sm:text-sm text-white tracking-wider truncate uppercase group-hover:text-cyan-300 transition-colors">
            {game.title}
          </h4>
          <p className="text-[10px] text-gray-400 truncate">
            {game.subtitle || 'Originals'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Sub-tabs */}
      <div className="space-y-2.5">
        {/* Search games input matching screenshot #4 */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games (Aviator, Mines, Chicken, 7 Up 7 Down...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#121927] border border-slate-800 rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sub-categories pill row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {subTabs.map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition flex-shrink-0 ${
                  active
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-[#121929] text-gray-400 hover:text-gray-200 border border-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* When Lobby is selected: Show categorized blocks matching screenshots #3 & #4 */}
      {activeSubTab === 'Lobby' && !searchQuery ? (
        <div className="space-y-6">
          {/* Hot Picks */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span className="italic text-amber-400 font-serif">H</span>
                <span className="font-gaming uppercase">ot Picks</span>
              </h3>
              <button
                onClick={() => setActiveSubTab('Originals')}
                className="text-xs text-cyan-400 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
              {hotPicks.map(renderGameCard)}
            </div>
          </section>

          {/* Originals - 99% RTP matching Screenshot #4 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span className="italic text-amber-400 font-serif">O</span>
                <span className="font-gaming uppercase">riginals – 99%RTP</span>
              </h3>
              <button
                onClick={() => setActiveSubTab('Originals')}
                className="text-xs text-cyan-400 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
              {originals.map(renderGameCard)}
            </div>
          </section>

          {/* Providers row matching screenshot #6 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span className="italic text-amber-400 font-serif">P</span>
                <span className="font-gaming uppercase">roviders</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Originals', count: '8 Games', color: 'from-blue-900 to-indigo-950' },
                { name: 'JILI', count: '224 Games', color: 'from-amber-900 to-yellow-950' },
                { name: 'PG Soft', count: '108 Games', color: 'from-emerald-900 to-teal-950' },
                { name: 'Spribe', count: '12 Games', color: 'from-rose-900 to-red-950' },
              ].map((prov) => (
                <div
                  key={prov.name}
                  onClick={() => setActiveSubTab('Originals')}
                  className={`bg-gradient-to-r ${prov.color} p-4 rounded-xl border border-slate-700/60 cursor-pointer hover:border-cyan-400/60 transition text-center`}
                >
                  <div className="font-black text-lg text-white font-gaming">{prov.name}</div>
                  <div className="text-xs text-gray-300">{prov.count}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Filtered Grid */
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
          {filteredGames.length > 0 ? (
            filteredGames.map(renderGameCard)
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm">
              No games found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
