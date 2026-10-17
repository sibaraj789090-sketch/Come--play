import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import confetti from 'canvas-confetti';
import { Bomb, Diamond, X, RotateCcw, AlertTriangle } from 'lucide-react';

export const MinesGame: React.FC = () => {
  const { currentUser, placeBet, settleBet, adminSettings, closeGame, showToast } = useGaming();

  const [minesCount, setMinesCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBetId, setCurrentBetId] = useState<string | null>(null);

  // 25 tiles
  // tile state: { revealed: boolean; isMine: boolean }
  const [tiles, setTiles] = useState<Array<{ revealed: boolean; isMine: boolean }>>(
    Array(25).fill({ revealed: false, isMine: false })
  );
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [isBusted, setIsBusted] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);

  // Multiplier formula based on mines & gems found
  const calculateMultiplier = (mines: number, gems: number): number => {
    if (gems === 0) return 1.0;
    let mult = 1.0;
    for (let i = 0; i < gems; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    // 97% RTP adjustment
    return parseFloat((mult * 0.97).toFixed(2));
  };

  const currentMultiplier = calculateMultiplier(minesCount, gemsFound);
  const nextMultiplier = calculateMultiplier(minesCount, gemsFound + 1);
  const currentPayout = parseFloat((betAmount * currentMultiplier).toFixed(2));

  const startGame = () => {
    if (!currentUser) return;
    if (currentUser.balance < betAmount) {
      showToast('Insufficient cash balance. Please deposit to play.');
      return;
    }

    const betId = placeBet({
      gameId: 'mines',
      gameName: 'Mines',
      amount: betAmount,
      multiplier: 1.0,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `Mines: ${minesCount} mines, Bet ₹${betAmount}`,
    });

    if (!betId) return;

    setCurrentBetId(betId);

    // Generate mine locations
    const mineIndices = new Set<number>();
    while (mineIndices.size < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      mineIndices.add(idx);
    }

    const newTiles = Array(25)
      .fill(null)
      .map((_, i) => ({
        revealed: false,
        isMine: mineIndices.has(i),
      }));

    setTiles(newTiles);
    setGemsFound(0);
    setIsBusted(false);
    setCashedOut(false);
    setIsPlaying(true);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || tiles[index].revealed || isBusted || cashedOut) return;

    const clickedTile = tiles[index];

    if (clickedTile.isMine) {
      // Hit a mine!
      setIsBusted(true);
      setIsPlaying(false);
      // Reveal all tiles
      setTiles((prev) =>
        prev.map((t) => ({ ...t, revealed: true }))
      );
      if (currentBetId) {
        settleBet(currentBetId, false);
      }
    } else {
      // Found a diamond!
      const newGems = gemsFound + 1;
      setGemsFound(newGems);
      const updatedTiles = [...tiles];
      updatedTiles[index] = { ...updatedTiles[index], revealed: true };
      setTiles(updatedTiles);

      // Check if all gems collected
      if (newGems === 25 - minesCount) {
        // Full house win!
        handleCashout(newGems);
      }
    }
  };

  const handleCashout = (overrideGems?: number) => {
    if (!isPlaying || isBusted || cashedOut || !currentBetId) return;
    const gems = overrideGems || gemsFound;
    if (gems === 0) return;

    const finalMult = calculateMultiplier(minesCount, gems);
    setCashedOut(true);
    setIsPlaying(false);
    setTiles((prev) => prev.map((t) => ({ ...t, revealed: true })));
    settleBet(currentBetId, true, finalMult);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3">
      <div className="w-full max-w-xl bg-[#0d1424] border border-cyan-900/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#131b2e] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💣</span>
            <span className="font-gaming font-black text-lg text-white tracking-wider">
              MINES ORIGINALS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono-num bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-cyan-300 font-bold">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </span>
            <button onClick={closeGame} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Controls Panel */}
          <div className="md:col-span-5 space-y-3 bg-[#11192a] p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Bet Amount */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Bet Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    disabled={isPlaying}
                    min="10"
                    max="5000"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-1 mt-1.5">
                  {[20, 50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      disabled={isPlaying}
                      onClick={() => setBetAmount(amt)}
                      className="flex-1 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mines Count Selector */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Mines Count: <span className="text-rose-400 font-mono-num">{minesCount}</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      disabled={isPlaying}
                      onClick={() => setMinesCount(num)}
                      className={`py-1 rounded text-xs font-bold transition ${
                        minesCount === num
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800 text-gray-400 hover:text-white disabled:opacity-50'
                      }`}
                    >
                      {num} {num === 1 ? 'Mine' : 'Mines'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Stats */}
              <div className="bg-[#0b101c] p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Gems Found:</span>
                  <span className="font-bold text-cyan-400">{gemsFound} / {25 - minesCount}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Current Mult:</span>
                  <span className="font-bold text-amber-400 font-mono-num">{currentMultiplier}x</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Next Tile:</span>
                  <span className="font-bold text-emerald-400 font-mono-num">{nextMultiplier}x</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div>
              {isPlaying ? (
                <button
                  disabled={gemsFound === 0}
                  onClick={() => handleCashout()}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-40"
                >
                  <div>CASH OUT ₹{currentPayout.toFixed(2)}</div>
                  <div className="text-[10px] font-mono-num font-bold">({currentMultiplier}x)</div>
                </button>
              ) : (
                <button
                  onClick={startGame}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95"
                >
                  START GAME (₹{betAmount})
                </button>
              )}
            </div>
          </div>

          {/* 5x5 Mines Board */}
          <div className="md:col-span-7 bg-[#080d17] p-3 rounded-xl border border-slate-800/80 aspect-square flex flex-col justify-center">
            <div className="grid grid-cols-5 gap-2 h-full">
              {tiles.map((tile, i) => (
                <button
                  key={i}
                  disabled={!isPlaying || tile.revealed}
                  onClick={() => handleTileClick(i)}
                  className={`rounded-xl transition-all duration-200 flex items-center justify-center font-bold text-xl select-none shadow-md ${
                    tile.revealed
                      ? tile.isMine
                        ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-400 scale-95'
                        : 'bg-cyan-950/80 border-2 border-cyan-400 text-cyan-300 scale-95'
                      : isPlaying
                      ? 'bg-[#182338] hover:bg-[#21304d] hover:border-cyan-500/40 border border-slate-700/60 active:scale-90 cursor-pointer'
                      : 'bg-[#141b2a] border border-slate-800 cursor-not-allowed opacity-80'
                  }`}
                >
                  {tile.revealed ? (
                    tile.isMine ? '💣' : '💎'
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
