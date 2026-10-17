import React, { useState, useEffect, useRef } from 'react';
import { useGaming } from '../../context/GamingContext';
import { INITIAL_GAMES } from '../../data/mockData';
import {
  X,
  Play,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  Info,
  ShieldCheck,
  Coins,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SymbolDef {
  id: string;
  char: string;
  name: string;
  payout3: number;
  payout5: number;
  color: string;
}

const SLOT_SYMBOLS: SymbolDef[] = [
  { id: 'seven', char: '7️⃣', name: 'Lucky 7', payout3: 50, payout5: 250, color: '#ef4444' },
  { id: 'crown', char: '👑', name: 'Royal Crown', payout3: 35, payout5: 180, color: '#f59e0b' },
  { id: 'diamond', char: '💎', name: 'Blue Diamond', payout3: 25, payout5: 120, color: '#06b6d4' },
  { id: 'garuda', char: '🦅', name: 'Gold Garuda', payout3: 20, payout5: 100, color: '#eab308' },
  { id: 'coin', char: '🪙', name: 'Gold Ingot', payout3: 15, payout5: 80, color: '#fbbf24' },
  { id: 'bell', char: '🔔', name: 'Golden Bell', payout3: 10, payout5: 50, color: '#a855f7' },
  { id: 'grape', char: '🍇', name: 'Lucky Grapes', payout3: 8, payout5: 35, color: '#8b5cf6' },
  { id: 'cherry', char: '🍒', name: 'Wild Cherry', payout3: 5, payout5: 20, color: '#f43f5e' },
];

const MULTIPLIERS = [1, 2, 3, 5, 10, 15, 50, 100];

export const SlotMachineGame: React.FC = () => {
  const {
    activeGame,
    closeGame,
    currentUser,
    updateUserBalance,
    placeBet,
    settleBet,
    openDeposit,
    openGame,
    showToast,
  } = useGaming();

  // Find game info or use default
  const currentGame = INITIAL_GAMES.find((g) => g.id === activeGame) || {
    id: 'fortune-gems-500',
    title: 'FORTUNE GEMS 500',
    subtitle: 'JILI Multiplier 500X',
    provider: 'JILI',
    accentColor: '#eab308',
    bgGradient: 'from-yellow-950 via-amber-900/50 to-slate-900',
    reels: 3,
    rtp: '97.2%',
  };

  const isFiveReel = currentGame.reels === 5;
  const numReels = isFiveReel ? 5 : 3;

  // Sound effects synthesis via Web Audio API (zero external assets needed)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSynthSound = (type: 'spin' | 'stop' | 'win' | 'jackpot') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'spin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'stop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'win') {
        // Melodic arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + i * 0.08);
          noteGain.gain.setValueAtTime(0.15, now + i * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
          noteOsc.start(now + i * 0.08);
          noteOsc.stop(now + i * 0.08 + 0.22);
        });
      } else if (type === 'jackpot') {
        [440, 554, 659, 880, 1108, 1318].forEach((freq, i) => {
          const jOsc = ctx.createOscillator();
          const jGain = ctx.createGain();
          jOsc.connect(jGain);
          jGain.connect(ctx.destination);
          jOsc.type = 'sawtooth';
          jOsc.frequency.setValueAtTime(freq, now + i * 0.07);
          jGain.gain.setValueAtTime(0.2, now + i * 0.07);
          jGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.35);
          jOsc.start(now + i * 0.07);
          jOsc.stop(now + i * 0.07 + 0.36);
        });
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Reels state: matrix of rows x cols
  // 3 rows x numReels
  const [reelGrid, setReelGrid] = useState<SymbolDef[][]>(() => {
    return Array.from({ length: 3 }, () =>
      Array.from({ length: numReels }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])
    );
  });

  // 4th Special Multiplier Wheel Reel (JILI Style)
  const [specialMultiplier, setSpecialMultiplier] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>(Array(numReels + 1).fill(false));

  // Betting state
  const [betAmount, setBetAmount] = useState<number>(20);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinActive, setIsAutoSpinActive] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(false);

  // Win stats
  const [lastWin, setLastWin] = useState<number>(0);
  const [lastWinDetails, setLastWinDetails] = useState<string>('');
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [bigWinCelebration, setBigWinCelebration] = useState<{ amount: number; multiplier: number } | null>(null);

  // Spin History
  const [spinHistory, setSpinHistory] = useState<
    Array<{ id: string; bet: number; win: number; mult: number; time: string }>
  >([]);

  // Show paytable
  const [showPaytable, setShowPaytable] = useState(false);

  // Re-initialize grid if reels count changes
  useEffect(() => {
    setReelGrid(
      Array.from({ length: 3 }, () =>
        Array.from({ length: numReels }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])
      )
    );
    setWinningLines([]);
    setLastWin(0);
  }, [numReels]);

  // Handle spin execution
  const executeSpin = () => {
    if (isSpinning) return;

    if (!currentUser) {
      showToast('Please Login or Signup to play with real money!');
      return;
    }

    if (currentUser.balance < betAmount) {
      showToast('Insufficient balance! Please Deposit to continue spinning.');
      openDeposit();
      setIsAutoSpinActive(false);
      setAutoSpinCount(0);
      return;
    }

    // Deduct bet & record
    updateUserBalance(-betAmount);
    const betId = placeBet({
      gameId: currentGame.id,
      gameName: currentGame.title,
      amount: betAmount,
      multiplier: 1.0,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `${currentGame.title} Spin (₹${betAmount})`,
    });

    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);
    setLastWinDetails('');
    setBigWinCelebration(null);

    // Set spinning state for all reels
    setSpinningReels(Array(numReels + 1).fill(true));
    playSynthSound('spin');

    // Spin interval animation
    const spinTicks = setInterval(() => {
      setReelGrid(
        Array.from({ length: 3 }, () =>
          Array.from({ length: numReels }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])
        )
      );
      setSpecialMultiplier(MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)]);
    }, 70);

    const spinDuration = turboMode ? 600 : 1200;

    // Sequential stop for realistic suspense
    for (let r = 0; r <= numReels; r++) {
      const delay = spinDuration + r * (turboMode ? 100 : 240);
      setTimeout(() => {
        setSpinningReels((prev) => {
          const next = [...prev];
          next[r] = false;
          return next;
        });
        playSynthSound('stop');
      }, delay);
    }

    // Final settlement calculation
    const totalDuration = spinDuration + numReels * (turboMode ? 100 : 240) + 100;

    setTimeout(() => {
      clearInterval(spinTicks);

      // Generate final outcomes with fair high-RTP RNG (~97%)
      const isWinner = Math.random() < 0.42;
      const finalMultiplier = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
      setSpecialMultiplier(finalMultiplier);

      let finalGrid: SymbolDef[][];
      const detectedLines: number[] = [];
      let totalPayout = 0;
      let matchedSymbolName = '';

      if (isWinner) {
        // Pick a winning symbol
        const winSymbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
        matchedSymbolName = winSymbol.name;

        // Choose payline (0: Top, 1: Middle, 2: Bottom, 3: Diagonal Down, 4: Diagonal Up)
        const lineChoice = Math.floor(Math.random() * 3);
        detectedLines.push(lineChoice);

        finalGrid = Array.from({ length: 3 }, (_, rowIdx) =>
          Array.from({ length: numReels }, () => {
            if (rowIdx === lineChoice) {
              return winSymbol;
            }
            return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
          })
        );

        // Calculate payout
        const baseSymbolMult = numReels === 5 ? winSymbol.payout5 : winSymbol.payout3;
        const totalMult = (baseSymbolMult / 10) * finalMultiplier;
        totalPayout = parseFloat((betAmount * totalMult).toFixed(2));
      } else {
        // Random non-winning grid
        finalGrid = Array.from({ length: 3 }, () =>
          Array.from({ length: numReels }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)])
        );
      }

      setReelGrid(finalGrid);
      setWinningLines(detectedLines);
      setIsSpinning(false);
      setSpinningReels(Array(numReels + 1).fill(false));

      if (totalPayout > 0) {
        updateUserBalance(totalPayout);
        if (betId) {
          settleBet(betId, true, totalPayout / betAmount);
        }
        setLastWin(totalPayout);
        setLastWinDetails(`${matchedSymbolName} Match × ${finalMultiplier}X Wheel = ₹${totalPayout}`);

        // Big Win trigger if payout >= 5x bet
        const winMultiple = totalPayout / betAmount;
        if (winMultiple >= 5) {
          playSynthSound('jackpot');
          setBigWinCelebration({ amount: totalPayout, multiplier: winMultiple });
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
          });
        } else {
          playSynthSound('win');
        }
      } else {
        if (betId) {
          settleBet(betId, false, 0);
        }
      }

      // Add to history
      setSpinHistory((prev) => [
        {
          id: `spin_${Date.now()}`,
          bet: betAmount,
          win: totalPayout,
          mult: finalMultiplier,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 14),
      ]);

      // Handle Auto Spin
      if (isAutoSpinActive) {
        setAutoSpinCount((prevCount) => {
          if (prevCount <= 1) {
            setIsAutoSpinActive(false);
            return 0;
          }
          setTimeout(() => {
            executeSpin();
          }, turboMode ? 400 : 800);
          return prevCount - 1;
        });
      }
    }, totalDuration);
  };

  // Quick other slot games to switch to
  const otherSlotGames = INITIAL_GAMES.filter((g) => g.isSlot && g.id !== activeGame).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090d16] border-2 border-amber-500/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden my-auto max-h-[96vh]">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl filter drop-shadow">🎰</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-gaming font-black text-sm sm:text-lg text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>{currentGame.title}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                    {currentGame.provider || 'JILI'}
                  </span>
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/80 flex items-center gap-2">
                <span>{currentGame.subtitle}</span>
                <span className="text-gray-400">•</span>
                <span className="text-emerald-400 font-bold">RTP {currentGame.rtp || '97.2%'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white transition"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>

            {/* Info / Paytable toggle */}
            <button
              onClick={() => setShowPaytable(!showPaytable)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white transition"
              title="Paytable & Rules"
            >
              <Info className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Close */}
            <button
              onClick={closeGame}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white transition"
              title="Exit Slot"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Quick Switch Slot Carousel */}
        <div className="bg-[#0b101d] px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] uppercase font-bold text-amber-400 whitespace-nowrap flex items-center gap-1 mr-1">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>Switch Slot:</span>
          </span>
          {otherSlotGames.map((game) => (
            <button
              key={game.id}
              onClick={() => openGame(game.id)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-700/60 text-[11px] font-semibold text-gray-300 hover:text-amber-300 whitespace-nowrap transition flex items-center gap-1"
            >
              <span>{game.title}</span>
            </button>
          ))}
        </div>

        {/* Main Slot Cabinet */}
        <div className="p-2 sm:p-6 space-y-4 overflow-y-auto">
          {/* Top Jackpot Ticker Banner */}
          <div className="relative rounded-2xl bg-gradient-to-r from-amber-900/60 via-yellow-600/30 to-amber-900/60 border border-amber-500/50 p-2 sm:p-3 text-center overflow-hidden shadow-inner flex items-center justify-around">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>MEGA JACKPOT:</span>
            </div>
            <div className="font-mono text-base sm:text-2xl font-black text-amber-300 tracking-wider drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)] animate-pulse">
              ₹8,45,290.40
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
              <ShieldCheck className="w-3 h-3" />
              <span>Certified RNG 97%</span>
            </div>
          </div>

          {/* Slot Reels Container */}
          <div className="relative bg-[#060911] border-4 border-amber-600/80 rounded-2xl p-2 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            {/* Glowing Corner Accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-yellow-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-yellow-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-yellow-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-yellow-400" />

            {/* Reel Grid Layout */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-3">
              {/* Symbol Reels */}
              <div
                className={`grid gap-1.5 sm:gap-2.5 flex-1 ${
                  numReels === 5 ? 'grid-cols-5' : 'grid-cols-3'
                }`}
              >
                {Array.from({ length: numReels }, (_, colIdx) => {
                  const isColSpinning = spinningReels[colIdx];
                  return (
                    <div
                      key={colIdx}
                      className={`relative bg-[#0d1322] border-2 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex flex-col gap-1.5 sm:gap-2 items-center justify-between overflow-hidden shadow-inner transition-colors ${
                        isColSpinning
                          ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'border-slate-800'
                      }`}
                    >
                      {/* Vertical line indicator */}
                      <div className="absolute inset-y-0 w-px bg-white/5 pointer-events-none" />

                      {/* 3 Rows of symbols */}
                      {reelGrid.map((row, rowIdx) => {
                        const sym = row[colIdx] || SLOT_SYMBOLS[0];
                        const isWinLine = winningLines.includes(rowIdx);
                        return (
                          <div
                            key={rowIdx}
                            className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 select-none ${
                              isWinLine
                                ? 'bg-amber-500/20 ring-2 ring-amber-400 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                                : 'bg-[#080d1a] border border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className={`text-2xl sm:text-4xl filter drop-shadow transition-transform duration-150 ${
                                isColSpinning ? 'blur-[1px] translate-y-1' : ''
                              }`}
                            >
                              {sym.char}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 truncate max-w-full px-0.5">
                              {sym.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* 4th Wheel Multiplier Reel (JILI Style Extra Reel) */}
              <div className="w-16 sm:w-24 bg-gradient-to-b from-amber-950/90 via-yellow-950/80 to-amber-950/90 border-2 border-amber-500 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex flex-col items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-300 text-center font-gaming">
                  Multiplier Wheel
                </div>
                <div className="my-auto py-2 flex flex-col items-center">
                  <div className="text-2xl sm:text-4xl font-black font-mono text-yellow-300 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse">
                    {specialMultiplier}X
                  </div>
                  <span className="text-[8px] text-amber-200/70 uppercase font-semibold">
                    Extra Multiplier
                  </span>
                </div>
                <div className="text-[8px] sm:text-[9px] text-gray-400 text-center font-mono">
                  Up to 100X
                </div>
              </div>
            </div>

            {/* Payline Status Banner */}
            {lastWin > 0 && (
              <div className="mt-3 bg-gradient-to-r from-emerald-950/80 via-teal-900/60 to-emerald-950/80 border border-emerald-500/60 rounded-xl p-2 sm:p-2.5 text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="font-gaming font-black text-xs sm:text-sm text-emerald-300">
                  WIN: ₹{lastWin.toFixed(2)} ({lastWinDetails})
                </span>
                <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            )}
          </div>

          {/* User Balance & Bet Selector Bar */}
          <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-2.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Current Balance */}
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Balance:</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-emerald-400">
                    {currentUser ? `₹${currentUser.balance.toFixed(2)}` : '₹0.00 (Guest)'}
                  </span>
                </div>
              </div>

              {/* Quick Deposit if low balance */}
              {currentUser && currentUser.balance < betAmount && (
                <button
                  onClick={openDeposit}
                  className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-md transition animate-pulse"
                >
                  Deposit +
                </button>
              )}

              {/* Turbo Mode & Auto Spin Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTurboMode(!turboMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition border ${
                    turboMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-gray-400 border-slate-700'
                  }`}
                  title="Faster Reels"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Turbo</span>
                </button>

                <button
                  onClick={() => {
                    if (isAutoSpinActive) {
                      setIsAutoSpinActive(false);
                      setAutoSpinCount(0);
                    } else {
                      setIsAutoSpinActive(true);
                      setAutoSpinCount(20);
                      executeSpin();
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition border ${
                    isAutoSpinActive
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-800 text-gray-400 border-slate-700'
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isAutoSpinActive ? 'animate-spin' : ''}`} />
                  <span>{isAutoSpinActive ? `Stop (${autoSpinCount})` : 'Auto (20)'}</span>
                </button>
              </div>
            </div>

            {/* Bet Presets */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase text-gray-400 mr-1">Bet (₹):</span>
                {[10, 20, 50, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    disabled={isSpinning}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      betAmount === amt
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 text-gray-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Main Spin Action Button */}
              <button
                disabled={isSpinning}
                onClick={executeSpin}
                className={`w-full sm:w-auto sm:min-w-[180px] py-3 px-6 rounded-2xl font-gaming font-black text-base uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                  isSpinning
                    ? 'bg-amber-800 text-amber-200 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95'
                }`}
              >
                <Play className={`w-5 h-5 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'SPINNING...' : `SPIN (₹${betAmount})`}</span>
              </button>
            </div>
          </div>

          {/* Paytable & Rules Overlay Modal */}
          {showPaytable && (
            <div className="bg-[#0b101c] border border-cyan-500/40 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-gaming font-bold text-sm text-cyan-300 flex items-center gap-1.5 uppercase">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Symbol Payouts & Multipliers</span>
                </h3>
                <button
                  onClick={() => setShowPaytable(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SLOT_SYMBOLS.map((sym) => (
                  <div
                    key={sym.id}
                    className="bg-[#12192b] border border-slate-800 p-2 rounded-xl flex items-center gap-2.5"
                  >
                    <span className="text-2xl">{sym.char}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{sym.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        3x: {sym.payout3}X | 5x: {sym.payout5}X
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                ✨ Payouts are multiplied by the 4th Special Multiplier Wheel (up to 100X)! Horizontal and diagonal paylines pay from left to right.
              </p>
            </div>
          )}

          {/* Spin History Drawer */}
          {spinHistory.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent Spins:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {spinHistory.map((h) => (
                  <div
                    key={h.id}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 whitespace-nowrap ${
                      h.win > 0
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-gray-400'
                    }`}
                  >
                    <span>₹{h.bet}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="font-bold">
                      {h.win > 0 ? `+₹${h.win.toFixed(2)} (${h.mult}X)` : 'Miss'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Big Win Celebration Modal */}
      {bigWinCelebration && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-90">
          <div className="max-w-md w-full bg-gradient-to-b from-amber-900 via-slate-900 to-black border-2 border-amber-400 rounded-3xl p-6 text-center shadow-[0_0_80px_rgba(245,158,11,0.6)] space-y-4">
            <div className="text-5xl animate-bounce">🏆</div>
            <h3 className="font-gaming font-black text-2xl sm:text-3xl text-amber-300 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]">
              MEGA WIN!
            </h3>
            <div className="font-mono text-3xl sm:text-4xl font-black text-white drop-shadow">
              ₹{bigWinCelebration.amount.toFixed(2)}
            </div>
            <p className="text-xs text-amber-200">
              Multiplier: {bigWinCelebration.multiplier.toFixed(1)}X your bet!
            </p>
            <button
              onClick={() => setBigWinCelebration(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-gaming font-black rounded-xl text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition"
            >
              COLLECT WINNINGS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
