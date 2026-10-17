import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  RotateCcw,
  Heart,
  Pin,
  Trophy,
} from 'lucide-react';
import { INITIAL_GAMES } from '../../data/mockData';
import { GameItem } from '../../types/gaming';

interface GamesGridProps {
  forcedCategory?: string;
}

export const GamesGrid: React.FC<GamesGridProps> = ({ forcedCategory }) => {
  const { openGame, showToast } = useGaming();
  const [activeSubTab, setActiveSubTab] = useState<string>(forcedCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllCategories, setSearchAllCategories] = useState(true);

  // Favorite games state persisted to localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cp_favorite_games');
      return saved ? JSON.parse(saved) : ['aviator', 'chicken-road-2', 'mines', '7up-7down'];
    } catch {
      return ['aviator', 'chicken-road-2', 'mines', '7up-7down'];
    }
  });

  // Sync favorites with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cp_favorite_games', JSON.stringify(favoriteIds));
    } catch (e) {
      console.error('Error saving favorite games:', e);
    }
  }, [favoriteIds]);

  const toggleFavorite = (gameId: string, gameTitle: string) => {
    setFavoriteIds((prev) => {
      const isAlreadyFav = prev.includes(gameId);
      if (isAlreadyFav) {
        showToast(`Removed "${gameTitle}" from favorites`);
        return prev.filter((id) => id !== gameId);
      } else {
        showToast(`Pinned "${gameTitle}" to top of Casino! ❤️`);
        return [gameId, ...prev];
      }
    });
  };

  // Calculate slot games count
  const allSlotsCount = useMemo(() => {
    return INITIAL_GAMES.filter((g) => g.isSlot || g.subCategory === 'slots' || g.category === 'slots').length;
  }, []);

  const [selectedSlotProvider, setSelectedSlotProvider] = useState<string>('ALL');

  const subTabs = [
    { id: 'All', label: `All Games (${INITIAL_GAMES.length})`, icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    {
      id: 'Slots',
      label: `🎰 Slots (${allSlotsCount})`,
      icon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'Favorites',
      label: `Favorites (${favoriteIds.length})`,
      icon: <Heart className={`w-3.5 h-3.5 ${favoriteIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />,
    },
    { id: 'HOT', label: 'Hot Picks', icon: <Flame className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'Originals', label: 'Originals – 99%RTP', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'Mini Game', label: 'Mini Game', icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'Table Games', label: 'Table Games', icon: <Dice5 className="w-3.5 h-3.5" /> },
    { id: 'Fishing', label: 'Fishing', icon: <Fish className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'Providers', label: 'Providers', icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  // Quick suggestion chips for rapid 1-tap search
  const popularGameChips = [
    { label: '🐘 Ganesha Fortune', query: 'Ganesha' },
    { label: '🎰 Fortune Gems', query: 'Fortune Gems' },
    { label: '🪙 Money Coming', query: 'Money Coming' },
    { label: '🔥 Crazy 777', query: 'Crazy 777' },
    { label: '👑 Super Ace', query: 'Super Ace' },
    { label: '⚡ Gates of Olympus', query: 'Olympus' },
    { label: '🍬 Sweet Bonanza', query: 'Bonanza' },
    { label: '🐅 Fortune Tiger', query: 'Tiger' },
    { label: '🦅 Fortune Garuda', query: 'Garuda' },
    { label: '✈️ Aviator', query: 'Aviator' },
    { label: '💣 Mines', query: 'Mines' },
    { label: '🎲 7 Up 7 Down', query: '7 Up' },
    { label: '🥊 Boxing King', query: 'Boxing' },
    { label: '🏛️ Golden Empire', query: 'Golden Empire' },
    { label: '⚔️ Roma X', query: 'Roma' },
    { label: '📈 Limbo', query: 'Limbo' },
  ];

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Pinned favorite games list
  const favoriteGameItems = useMemo(() => {
    return favoriteIds
      .map((id) => INITIAL_GAMES.find((g) => g.id === id))
      .filter((g): g is GameItem => Boolean(g));
  }, [favoriteIds]);

  const filteredGames = useMemo(() => {
    const list = INITIAL_GAMES.filter((game) => {
      // Real-time title & subtitle match
      const titleMatch = game.title.toLowerCase().includes(cleanQuery);
      const subtitleMatch = game.subtitle ? game.subtitle.toLowerCase().includes(cleanQuery) : false;
      const tagMatch = game.tag ? game.tag.toLowerCase().includes(cleanQuery) : false;
      const providerMatch = game.provider ? game.provider.toLowerCase().includes(cleanQuery) : false;

      const matchesSearch = !cleanQuery || titleMatch || subtitleMatch || tagMatch || providerMatch;
      if (!matchesSearch) return false;

      // When searching across all categories, don't restrict to sub-tab
      if (cleanQuery && searchAllCategories) return true;

      // Category tab filtering
      if (activeSubTab === 'All' || activeSubTab === 'Lobby') return true;
      if (activeSubTab === 'HOT') return game.tag === 'HOT';
      if (activeSubTab === 'Favorites') return favoriteIds.includes(game.id);
      if (activeSubTab === 'Originals') return game.category === 'originals' || game.subCategory === 'originals' || game.tag === '99% RTP';
      if (activeSubTab === 'Slots') {
        // User requested: "Yah sare game's ( slots me add koro )"
        // Includes all slots and featured games
        const isSlotItem = game.isSlot || game.subCategory === 'slots' || game.category === 'slots';
        if (!isSlotItem) return false;

        if (selectedSlotProvider !== 'ALL') {
          return game.provider === selectedSlotProvider;
        }
        return true;
      }
      if (activeSubTab === 'Mini Game') return game.subCategory === 'mini-game' || game.category === 'mini-game';
      if (activeSubTab === 'Table Games') return game.subCategory === 'table';
      if (activeSubTab === 'Fishing') return game.category === 'fishing';
      return true;
    });

    // In 'All' or 'Favorites', prioritize favorited games at the top
    if (activeSubTab === 'All' || activeSubTab === 'Lobby') {
      return list;
    }

    return list.sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 1 : 0;
      const bFav = favoriteIds.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [cleanQuery, activeSubTab, searchAllCategories, favoriteIds, selectedSlotProvider]);

  // If forcedCategory is set (like in Explore page preview), limit to 12
  const gamesToDisplay = forcedCategory ? filteredGames.slice(0, 12) : filteredGames;

  const renderGameCard = (game: GameItem) => {
    const isExactMatch = cleanQuery && game.title.toLowerCase().includes(cleanQuery);
    const isFav = favoriteIds.includes(game.id);

    return (
      <div key={game.id} className="flex flex-col gap-1.5 group">
        {/* Main Card with Visual Artwork & Badges */}
        <div
          onClick={() => {
            openGame(game.id);
          }}
          className={`relative rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden cursor-pointer border transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl bg-gradient-to-br ${game.bgGradient} aspect-[3/4] sm:aspect-[4/5] shadow-lg ${
            isExactMatch
              ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
              : isFav
              ? 'border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
              : 'border-slate-800/90 hover:border-cyan-500/60'
          }`}
        >
          {/* Subtle shine / dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors pointer-events-none" />

          {/* Top Badges & Favorite Heart Button */}
          <div className="flex items-center justify-between z-10 w-full">
            <div className="flex items-center gap-1 flex-wrap">
              {game.tag && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-md ${
                    game.tag === 'HOT'
                      ? 'bg-rose-600 text-white'
                      : game.tag === 'NEW'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                  }`}
                >
                  {game.tag}
                </span>
              )}

              {game.provider && (
                <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 uppercase tracking-tighter">
                  {game.provider}
                </span>
              )}

              {isFav && (
                <span
                  className="bg-rose-500/20 text-rose-300 border border-rose-500/40 p-0.5 px-1 rounded text-[8px] font-bold flex items-center gap-0.5"
                  title="Pinned to Top"
                >
                  <Pin className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                  <span className="hidden sm:inline">PIN</span>
                </span>
              )}
            </div>

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(game.id, game.title);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-75 ${
                isFav
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 ring-1 ring-rose-500/50'
                  : 'bg-black/50 text-gray-400 hover:text-rose-400 hover:bg-black/80'
              }`}
              title={isFav ? 'Unpin from favorites' : 'Pin to top of Casino Lobby'}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  isFav ? 'fill-rose-500 text-rose-500 scale-110' : 'hover:scale-110'
                }`}
              />
            </button>
          </div>

          {/* Center Visual Art / Icon */}
          <div className="flex-1 flex flex-col items-center justify-center py-1 relative z-10">
            <div className="text-4xl sm:text-5xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)] transform group-hover:scale-110 transition-transform duration-300 select-none">
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
              {game.iconType === 'wheel' && '🎡'}
              {game.iconType === 'board' && '♟️'}
              {game.iconType === 'coin' && '🪙'}
              {game.iconType === 'snake' && '🐍'}
              {game.iconType === 'crown' && '👑'}
              {game.iconType === 'seven' && '7️⃣'}
              {game.iconType === 'boxer' && '🥊'}
              {game.iconType === 'octopus' && '🐙'}
              {game.iconType === 'money-bag' && '💰'}
              {game.iconType === 'balloon' && '🎈'}
              {game.iconType === 'bull' && '🐂'}
              {game.iconType === 'dragon' && '🐉'}
              {game.iconType === 'pig' && '🐷'}
              {game.iconType === 'target' && '🎯'}
              {game.iconType === 'bomb' && '💣'}
              {game.iconType === 'cards' && '🃏'}
              {game.iconType === 'ganesha' && '🐘'}
            </div>

            {/* Play Overlay */}
            {game.isPlayable && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] rounded-lg">
                <span className="w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform font-bold">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </span>
              </div>
            )}
          </div>

          {/* Bottom Game Title Inside Card matching Screenshot */}
          <div className="z-10 text-center pb-0.5">
            <h4 className="font-gaming font-black text-xs sm:text-sm text-white tracking-wider truncate uppercase group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {game.title}
            </h4>
            {game.subtitle && (
              <p className="text-[9px] sm:text-[10px] text-gray-400 truncate opacity-90">
                {game.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Live player count with Green Dot right below the card (Exact match to Screenshots 1-5) */}
        <div className="flex items-center gap-1 px-1 text-[10px] text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="font-mono-num font-bold text-gray-300">{game.playersCount.toLocaleString()}</span>
          <span>playing</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Real-Time Search Bar & Filter Controls (When not in forced preview mode) */}
      {!forcedCategory && (
        <div className="bg-[#0f172a]/90 border border-cyan-900/50 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-sm space-y-3">
          {/* Main Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search casino games by title (e.g. Aviator, Mines, Chicken, Limbo, Dice)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-[#090d16] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 transition shadow-inner font-medium"
            />

            {/* Right actions inside search bar: Match count & Clear button */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {cleanQuery && (
                <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold hidden sm:inline">
                  {filteredGames.length} found
                </span>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 transition"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap flex items-center gap-1 mr-1">
              <Flame className="w-3 h-3 text-rose-500" />
              <span>Popular:</span>
            </span>
            {popularGameChips.map((chip) => {
              const isSelected = cleanQuery === chip.query.toLowerCase();
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSearchQuery('');
                    } else {
                      setSearchQuery(chip.query);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                      : 'bg-[#151d30] border-slate-800 text-gray-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Active Search Notification Banner */}
          {cleanQuery && (
            <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-xl text-xs text-cyan-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  Filtering games for <strong className="text-white">"{searchQuery}"</strong> ({filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} matching)
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline font-bold text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Search</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Sub-categories Pill Row (When not in forced preview mode) */}
      {!forcedCategory && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {subTabs.map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  if (tab.id !== 'All' && tab.id !== 'Lobby') {
                    setSearchAllCategories(false);
                  } else {
                    setSearchAllCategories(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition flex-shrink-0 ${
                  active
                    ? tab.id === 'Favorites'
                      ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-[#121929] text-gray-400 hover:text-gray-200 border border-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Slots Dedicated Provider Banner & Quick Filter Chips */}
      {!forcedCategory && activeSubTab === 'Slots' && (
        <div className="bg-gradient-to-r from-amber-950/50 via-yellow-950/40 to-amber-950/50 border border-amber-500/50 rounded-2xl p-3 sm:p-4 space-y-3 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl filter drop-shadow">🎰</span>
              <div>
                <h4 className="font-gaming font-black text-xs sm:text-sm text-amber-300 uppercase tracking-wide">
                  SLOTS CATALOG – ALL GAMES ADDED ({allSlotsCount} GAMES)
                </h4>
                <p className="text-[10px] sm:text-xs text-amber-200/80">
                  Featured JILI, Pragmatic Play, PG Soft, Spribe & ComePlay slots with up to 10000X Jackpots
                </p>
              </div>
            </div>
            <button
              onClick={() => openGame('ganesha-fortune')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-purple-950 font-gaming font-black rounded-xl text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition"
            >
              <span className="text-sm">🐘</span>
              <span>Play Ganesha Fortune</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'ALL', label: `All Slots (${allSlotsCount})` },
              { id: 'JILI', label: '🔥 JILI Games' },
              { id: 'PRAGMATIC', label: '⚡ Pragmatic Play' },
              { id: 'PG SOFT', label: '🐅 PG Soft' },
              { id: 'SPRIBE', label: '✈️ Spribe' },
              { id: 'COMEPLAY', label: '👑 ComePlay' },
            ].map((prov) => (
              <button
                key={prov.id}
                onClick={() => setSelectedSlotProvider(prov.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedSlotProvider === prov.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] font-black'
                    : 'bg-[#0f172a] text-gray-300 hover:text-white border-slate-700/80 hover:border-amber-500/50'
                }`}
              >
                {prov.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Pinned Favorites Top Banner (Only in All / Lobby tab if favorites exist and not searching) */}
      {!forcedCategory && (activeSubTab === 'All' || activeSubTab === 'Lobby') && !cleanQuery && favoriteGameItems.length > 0 && (
        <section className="space-y-2.5 bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-slate-900/60 p-3 sm:p-4 rounded-2xl border border-rose-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="font-gaming uppercase tracking-wide">Pinned Favorites ({favoriteGameItems.length})</span>
            </h3>
            <button
              onClick={() => setActiveSubTab('Favorites')}
              className="text-[11px] text-rose-400 hover:underline font-semibold"
            >
              View Favorites
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
            {favoriteGameItems.map(renderGameCard)}
          </div>
        </section>
      )}

      {/* 4. Complete Games Grid (Displays ALL games matching Screenshots 1 to 5) */}
      <div className="space-y-3">
        {!forcedCategory && (
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs sm:text-sm text-gray-300 font-gaming uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>
                {activeSubTab === 'Favorites'
                  ? `Favorites (${gamesToDisplay.length})`
                  : activeSubTab === 'HOT'
                  ? `Hot Hits (${gamesToDisplay.length})`
                  : activeSubTab === 'Originals'
                  ? `Originals 99% RTP (${gamesToDisplay.length})`
                  : activeSubTab === 'Slots'
                  ? `Slots & Featured Games (${gamesToDisplay.length})`
                  : `All Games (${gamesToDisplay.length})`}
              </span>
            </h3>
            <span className="text-[11px] text-gray-500">Live Real-Money Games</span>
          </div>
        )}

        {gamesToDisplay.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3 animate-in fade-in">
            {gamesToDisplay.map(renderGameCard)}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-gray-400 text-2xl">
              🔍
            </div>
            <div>
              <h4 className="text-base font-bold text-white">No games found for "{searchQuery}"</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Try checking for typos or use one of our popular game filters below.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSubTab('All');
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Clear Search & View All {INITIAL_GAMES.length} Games
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Providers row matching screenshot #6 */}
      {!forcedCategory && (
        <section className="space-y-3 pt-4 border-t border-slate-800/80">
          <h3 className="font-bold text-xs sm:text-sm text-gray-300 flex items-center gap-1.5 uppercase font-gaming">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Gaming Providers</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Originals', count: '10 Games', color: 'from-blue-900 to-indigo-950' },
              { name: 'JILI', count: '224 Games', color: 'from-amber-900 to-yellow-950' },
              { name: 'PG Soft', count: '108 Games', color: 'from-emerald-900 to-teal-950' },
              { name: 'Spribe', count: '12 Games', color: 'from-rose-900 to-red-950' },
            ].map((prov) => (
              <div
                key={prov.name}
                onClick={() => {
                  setActiveSubTab('Originals');
                  setSearchQuery(prov.name === 'Originals' ? '' : prov.name);
                }}
                className={`bg-gradient-to-r ${prov.color} p-4 rounded-xl border border-slate-700/60 cursor-pointer hover:border-cyan-400/60 transition text-center`}
              >
                <div className="font-black text-lg text-white font-gaming">{prov.name}</div>
                <div className="text-xs text-gray-300">{prov.count}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
