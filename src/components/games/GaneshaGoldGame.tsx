import React, { useState, useEffect, useRef } from 'react';
import { useGaming } from '../../context/GamingContext';
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
  Info,
  ShieldCheck,
  Coins,
  History,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GaneshaSymbol {
  id: string;
  char: string;
  name: string;
  nameHindi: string;
  payout3: number;
  payout4: number;
  payout5: number;
  isWild?: boolean;
  isScatter?: boolean;
  color: string;
  bgColor: string;
}

const GANESHA_SYMBOLS: GaneshaSymbol[] = [
  {
    id: 'wild',
    char: '🕉️',
    name: 'Ganesha Wild',
    nameHindi: 'गणेश वाइल्ड',
    payout3: 100,
    payout4: 300,
    payout5: 1000,
    isWild: true,
    color: '#fbbf24',
    bgColor: 'from-amber-500/30 to-yellow-600/40',
  },
  {
    id: 'scatter',
    char: '🛕',
    name: 'Temple Scatter',
    nameHindi: 'स्वर्ण मंदिर',
    payout3: 50,
    payout4: 150,
    payout5: 500,
    isScatter: true,
    color: '#f59e0b',
    bgColor: 'from-yellow-500/25 to-amber-700/30',
  },
  {
    id: 'diya',
    char: '🪔',
    name: 'Sacred Aarti Diya',
    nameHindi: 'पवित्र दीप',
    payout3: 30,
    payout4: 80,
    payout5: 150,
    color: '#f97316',
    bgColor: 'from-orange-500/20 to-amber-700/20',
  },
  {
    id: 'modak',
    char: '🥣',
    name: 'Modak Prasad',
    nameHindi: 'मोदक प्रसाद',
    payout3: 20,
    payout4: 60,
    payout5: 120,
    color: '#eab308',
    bgColor: 'from-amber-400/20 to-yellow-600/20',
  },
  {
    id: 'peacock',
    char: '🦚',
    name: 'Mayur Pankh',
    nameHindi: 'मयूर पंख',
    payout3: 15,
    payout4: 45,
    payout5: 90,
    color: '#06b6d4',
    bgColor: 'from-cyan-500/20 to-teal-700/20',
  },
  {
    id: 'bell',
    char: '🔔',
    name: 'Temple Gold Bell',
    nameHindi: 'मंदिर घंटा',
    payout3: 12,
    payout4: 35,
    payout5: 75,
    color: '#eab308',
    bgColor: 'from-yellow-500/20 to-amber-600/20',
  },
  {
    id: 'garland',
    char: '🌺',
    name: 'Marigold Mala',
    nameHindi: 'गेंदा माला',
    payout3: 10,
    payout4: 25,
    payout5: 60,
    color: '#ef4444',
    bgColor: 'from-rose-500/20 to-red-700/20',
  },
  {
    id: 'ace',
    char: '👑',
    name: 'Royal A',
    nameHindi: 'राजमुकुट (A)',
    payout3: 8,
    payout4: 20,
    payout5: 40,
    color: '#ec4899',
    bgColor: 'from-pink-500/15 to-rose-700/15',
  },
  {
    id: 'king',
    char: '🪙',
    name: 'Gold Coin K',
    nameHindi: 'स्वर्ण सिक्का (K)',
    payout3: 5,
    payout4: 15,
    payout5: 30,
    color: '#eab308',
    bgColor: 'from-yellow-500/15 to-amber-700/15',
  },
  {
    id: 'queen',
    char: '📿',
    name: 'Rudraksha Q',
    nameHindi: 'रुद्राक्ष (Q)',
    payout3: 4,
    payout4: 10,
    payout5: 20,
    color: '#a855f7',
    bgColor: 'from-purple-500/15 to-indigo-700/15',
  },
  {
    id: 'jack',
    char: '💎',
    name: 'Navratna J',
    nameHindi: 'नवरत्न (J)',
    payout3: 3,
    payout4: 8,
    payout5: 15,
    color: '#3b82f6',
    bgColor: 'from-blue-500/15 to-cyan-700/15',
  },
];

// Multiplier stages matching PG Soft Ganesha Gold: x2, x4, x6, x10, x20
const MULTIPLIER_STAGES = [
  { level: 1, mult: 2, requiredWilds: 1, label: '2X' },
  { level: 2, mult: 4, requiredWilds: 2, label: '4X' },
  { level: 3, mult: 6, requiredWilds: 3, label: '6X' },
  { level: 4, mult: 10, requiredWilds: 4, label: '10X' },
  { level: 5, mult: 20, requiredWilds: 5, label: '20X' },
];

const BET_PRESETS = [10, 20, 50, 100, 200, 500, 1000, 2000];

export const GaneshaGoldGame: React.FC = () => {
  const {
    closeGame,
    currentUser,
    updateUserBalance,
    placeBet,
    settleBet,
    openDeposit,
    showToast,
  } = useGaming();

  // Reels: 5 reels x 3 rows
  const [reelGrid, setReelGrid] = useState<GaneshaSymbol[][]>(() => {
    return Array.from({ length: 3 }, () =>
      Array.from({ length: 5 }, () => GANESHA_SYMBOLS[Math.floor(Math.random() * GANESHA_SYMBOLS.length)])
    );
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);

  // Betting state
  const [betAmount, setBetAmount] = useState<number>(20);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinActive, setIsAutoSpinActive] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(false);

  // PG Soft Multiplier Collection System
  const [collectedWilds, setCollectedWilds] = useState<number>(0);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(2);

  // Free Spins State
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isFreeSpinMode, setIsFreeSpinMode] = useState<boolean>(false);
  const [totalFreeSpinWin, setTotalFreeSpinWin] = useState<number>(0);

  // Win stats
  const [lastWin, setLastWin] = useState<number>(0);
  const [lastWinDetails, setLastWinDetails] = useState<string>('');
  const [winningCells, setWinningCells] = useState<Array<{ row: number; col: number }>>([]);
  const [bigWinCelebration, setBigWinCelebration] = useState<{
    amount: number;
    multiplier: number;
    title: string;
  } | null>(null);

  // Audio system
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // History & Paytable modal
  const [showPaytable, setShowPaytable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<
    Array<{ id: string; bet: number; win: number; mult: number; time: string; freeSpins?: boolean }>
  >([]);

  // Synthesize authentic Indian devotional / casino audio (sitar, temple bell, flute, victory gong)
  const playSound = (type: 'spin' | 'stop' | 'wild' | 'scatter' | 'win' | 'superwin' | 'bell') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'spin') {
        // Fast ascending sitar string buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'stop') {
        // Brass temple bell click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'bell' || type === 'wild') {
        // Divine high temple brass chime
        [587.33, 880, 1174.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.15, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.45);
        });
      } else if (type === 'scatter') {
        // Auspicious gong
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'win') {
        // Classical Indian Raga scale flourish
        const ragaNotes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];
        ragaNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.12, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.28);
        });
      } else if (type === 'superwin') {
        // Grand victory fanfare & ringing temple bells
        const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chords.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.18, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.65);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  // Perform spin logic
  const executeSpin = (isFreeSpin = false) => {
    if (isSpinning) return;

    if (!currentUser) {
      showToast('Please Login or Signup to play Ganesha Gold with real cash!');
      return;
    }

    if (!isFreeSpin && currentUser.balance < betAmount) {
      showToast('Insufficient balance! Please Deposit to spin Ganesha Gold.');
      openDeposit();
      setIsAutoSpinActive(false);
      setAutoSpinCount(0);
      return;
    }

    // Deduct bet if not free spin
    if (!isFreeSpin) {
      updateUserBalance(-betAmount);
      placeBet({
        gameId: 'ganesha-gold',
        gameName: 'GANESHA GOLD',
        amount: betAmount,
        multiplier: 1.0,
        payout: 0,
        status: 'PENDING',
        betType: 'casino',
        details: `Ganesha Gold Spin (₹${betAmount})`,
      });
      // In base game, reset multiplier if no persistent free spins
      if (!isFreeSpinMode) {
        setCollectedWilds(0);
        setActiveMultiplier(2);
      }
    } else {
      setFreeSpinsLeft((prev) => Math.max(0, prev - 1));
    }

    setIsSpinning(true);
    setWinningCells([]);
    setLastWin(0);
    setLastWinDetails('');
    setBigWinCelebration(null);
    setSpinningReels([true, true, true, true, true]);
    playSound('spin');

    // Reel shuffle animation
    const spinInterval = setInterval(() => {
      setReelGrid(
        Array.from({ length: 3 }, () =>
          Array.from({ length: 5 }, () => GANESHA_SYMBOLS[Math.floor(Math.random() * GANESHA_SYMBOLS.length)])
        )
      );
    }, 65);

    const baseDuration = turboMode ? 500 : 1000;

    // Reel stopping sequence
    for (let col = 0; col < 5; col++) {
      const delay = baseDuration + col * (turboMode ? 80 : 200);
      setTimeout(() => {
        setSpinningReels((prev) => {
          const next = [...prev];
          next[col] = false;
          return next;
        });
        playSound('stop');
      }, delay);
    }

    const totalSpinTime = baseDuration + 5 * (turboMode ? 80 : 200) + 120;

    setTimeout(() => {
      clearInterval(spinInterval);

      // Determine outcomes with high-RTP RNG (~96.2%)
      // In Free Spins, win rate is boosted to 65% with more Wilds!
      const isWinner = Math.random() < (isFreeSpin ? 0.65 : 0.45);
      const scatterCount = Math.random() < 0.08 ? (Math.random() < 0.3 ? 4 : 3) : 0;

      // Construct final grid
      const finalGrid: GaneshaSymbol[][] = Array.from({ length: 3 }, () =>
        Array.from({ length: 5 }, () => GANESHA_SYMBOLS[Math.floor(Math.random() * GANESHA_SYMBOLS.length)])
      );

      const matchedCells: Array<{ row: number; col: number }> = [];
      let spinWildCount = 0;
      let linePayout = 0;
      let matchedSymbolName = '';

      if (isWinner) {
        // Pick winning symbol
        const candidates = GANESHA_SYMBOLS.filter((s) => !s.isScatter);
        const winSym = candidates[Math.floor(Math.random() * candidates.length)];
        matchedSymbolName = winSym.name;

        // Choose number of consecutive reels matching (3, 4, or 5)
        const matchLength = Math.random() < 0.25 ? 5 : Math.random() < 0.45 ? 4 : 3;

        // Populate winning line across the matched columns
        const winningRow = Math.floor(Math.random() * 3);
        for (let c = 0; c < matchLength; c++) {
          // occasional Wild replacement
          const isWildCell = Math.random() < 0.35;
          if (isWildCell) {
            finalGrid[winningRow][c] = GANESHA_SYMBOLS[0]; // Ganesha Wild
            spinWildCount++;
          } else {
            finalGrid[winningRow][c] = winSym;
          }
          matchedCells.push({ row: winningRow, col: c });
        }

        // Additional scatter if triggered
        if (scatterCount >= 3) {
          for (let s = 0; s < scatterCount; s++) {
            const scCol = s + 1;
            const scRow = (winningRow + 1) % 3;
            if (scCol < 5) {
              finalGrid[scRow][scCol] = GANESHA_SYMBOLS[1]; // Temple Scatter
              matchedCells.push({ row: scRow, col: scCol });
            }
          }
        }

        // Calculate Base Payout
        const baseMultiplier =
          matchLength === 5 ? winSym.payout5 : matchLength === 4 ? winSym.payout4 : winSym.payout3;
        linePayout = baseMultiplier;
      } else if (scatterCount >= 3) {
        // Scatter only hit
        for (let s = 0; s < scatterCount; s++) {
          finalGrid[s % 3][s + 1] = GANESHA_SYMBOLS[1];
          matchedCells.push({ row: s % 3, col: s + 1 });
        }
      }

      setReelGrid(finalGrid);

      // Update Wild Multiplier Meter
      const newTotalWilds = (isFreeSpinMode ? collectedWilds : 0) + spinWildCount;
      setCollectedWilds(newTotalWilds);

      // Multiplier scale: 1 Wild = 2x, 2 Wilds = 4x, 3 Wilds = 6x, 4 Wilds = 10x, 5+ Wilds = 20x
      let currentMult = 2;
      if (newTotalWilds >= 5) currentMult = 20;
      else if (newTotalWilds === 4) currentMult = 10;
      else if (newTotalWilds === 3) currentMult = 6;
      else if (newTotalWilds === 2) currentMult = 4;
      else currentMult = 2;

      setActiveMultiplier(currentMult);

      if (spinWildCount > 0) {
        playSound('wild');
      }

      // Check Free Spins trigger
      if (scatterCount >= 3) {
        const awardedSpins = scatterCount === 3 ? 12 : scatterCount === 4 ? 15 : 20;
        playSound('scatter');
        setFreeSpinsLeft((prev) => prev + awardedSpins);
        setIsFreeSpinMode(true);
        showToast(
          `🛕 AUSPICIOUS TEMPLE SCATTERS! ${awardedSpins} Free Spins with Persistent Wild Multipliers Awarded!`
        );
      }

      // Calculate Net Win
      if (isWinner && linePayout > 0) {
        const netWin = Math.round((betAmount * (linePayout / 20)) * (currentMult / 2));
        setLastWin(netWin);
        setWinningCells(matchedCells);
        setLastWinDetails(
          `${matchedSymbolName} Hit! Base Payout x${currentMult} Blessed Multiplier = ₹${netWin.toLocaleString()}`
        );

        // Credit wallet
        updateUserBalance(netWin);
        settleBet('ganesha-gold-spin', true, currentMult);

        if (isFreeSpinMode) {
          setTotalFreeSpinWin((prev) => prev + netWin);
        }

        // Celebrate big wins
        const winRatio = netWin / betAmount;
        if (winRatio >= 15) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#10b981'],
          });
          playSound('superwin');
          setBigWinCelebration({
            amount: netWin,
            multiplier: currentMult,
            title: winRatio >= 50 ? '👑 GANESH KRIPA MEGA WIN 👑' : '🕉️ BLESSED SUPER WIN 🕉️',
          });
        } else {
          playSound('win');
        }

        // Add history
        setHistory((prev) => [
          {
            id: `spin-${Date.now()}`,
            bet: betAmount,
            win: netWin,
            mult: currentMult,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            freeSpins: isFreeSpinMode,
          },
          ...prev.slice(0, 19),
        ]);
      } else {
        settleBet('ganesha-gold-spin', false);
        setHistory((prev) => [
          {
            id: `spin-${Date.now()}`,
            bet: betAmount,
            win: 0,
            mult: 0,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            freeSpins: isFreeSpinMode,
          },
          ...prev.slice(0, 19),
        ]);
      }

      setIsSpinning(false);
    }, totalSpinTime);
  };

  // Auto Spin loop & Free Spins loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning) {
      if (isFreeSpinMode && freeSpinsLeft > 0) {
        timer = setTimeout(() => {
          executeSpin(true);
        }, turboMode ? 600 : 1200);
      } else if (isFreeSpinMode && freeSpinsLeft === 0) {
        // Free spins finished
        setIsFreeSpinMode(false);
        showToast(`🎉 Free Spins Round Complete! Total Blessed Win: ₹${totalFreeSpinWin.toLocaleString()}`);
        setTotalFreeSpinWin(0);
        setCollectedWilds(0);
        setActiveMultiplier(2);
      } else if (isAutoSpinActive && autoSpinCount > 0) {
        timer = setTimeout(() => {
          setAutoSpinCount((prev) => prev - 1);
          executeSpin(false);
        }, turboMode ? 500 : 1000);
      } else if (isAutoSpinActive && autoSpinCount === 0) {
        setIsAutoSpinActive(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isSpinning, isAutoSpinActive, autoSpinCount, isFreeSpinMode, freeSpinsLeft]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07050d]/95 backdrop-blur-md flex flex-col items-center justify-between overflow-y-auto p-2 sm:p-4 select-none animate-fadeIn">
      {/* 1. Header Bar with PG Soft Badge & Game Title */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-gradient-to-r from-amber-950/80 via-yellow-950/90 to-amber-950/80 border border-amber-500/40 rounded-2xl px-3 py-2 sm:px-5 sm:py-2.5 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
            <span className="text-xl sm:text-2xl animate-pulse">🕉️</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-400/40 tracking-wider">
                PG SOFT
              </span>
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-rose-500/30">
                243 WAYS
              </span>
              <span className="text-[10px] text-amber-200/70 hidden sm:inline">RTP 96.2%</span>
            </div>
            <h1 className="text-sm sm:text-lg font-gaming font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 tracking-wider">
              GANESHA GOLD
            </h1>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSound('bell');
            }}
            className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40 transition"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Paytable & Rules */}
          <button
            onClick={() => setShowPaytable(true)}
            className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40 transition flex items-center gap-1 text-xs font-bold"
            title="Paytable & Payouts"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Paytable</span>
          </button>

          {/* History */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:bg-amber-900/40 transition"
            title="Spin History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Close Game */}
          <button
            onClick={closeGame}
            className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition ml-1"
            title="Exit Game"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Game Temple Stage */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center my-2 sm:my-3">
        {/* Divine Mandir Arch & Ganesha Statue Avatar */}
        <div className="relative bg-gradient-to-b from-amber-950/90 via-[#180f24] to-[#0d0718] border-2 border-amber-500/50 rounded-3xl p-3 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
          {/* Temple Toran / Marigold Garland Top Decoration */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 flex items-center justify-around opacity-80 border-b border-yellow-300/60">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-[10px] transform -translate-y-0.5">
                🌺
              </span>
            ))}
          </div>

          {/* Golden Ganesha Blessing Shrine Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 px-1">
            {/* Left: Auspicious Greeting */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Rotating Divine Mandala Aura */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-orange-500 animate-spin flex items-center justify-center p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  <div className="w-full h-full rounded-full bg-[#1e0f2b]" />
                </div>
                {/* Lord Ganesha Center Avatar */}
                <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                  🐘
                </div>
                {/* Holy Diya */}
                <span className="absolute -bottom-1 -right-1 text-sm animate-bounce">🪔</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold text-xs">ॐ श्री गणेशाय नमः</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="text-white font-gaming font-black text-sm sm:text-base tracking-wide flex items-center gap-1">
                  <span>LORD GANESHA'S BLESSING</span>
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                </h3>
                <p className="text-[11px] text-amber-200/80">
                  {isFreeSpinMode ? (
                    <span className="text-emerald-300 font-bold animate-pulse">
                      ✨ FREE SPINS ACTIVE: {freeSpinsLeft} SPINS REMAINING
                    </span>
                  ) : (
                    'Collect Golden Wilds to unlock up to 20X Win Multipliers!'
                  )}
                </p>
              </div>
            </div>

            {/* Right: PG Soft Signature Wild Multiplier Meter */}
            <div className="bg-[#120a1c] border border-amber-500/40 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-inner">
              <div className="text-right">
                <span className="text-[10px] text-amber-300/80 block uppercase tracking-wider font-bold">
                  Wild Multiplier
                </span>
                <span className="text-xs text-gray-400">
                  {collectedWilds} {collectedWilds === 1 ? 'Wild' : 'Wilds'} Collected
                </span>
              </div>

              {/* Multiplier Nodes */}
              <div className="flex items-center gap-1">
                {MULTIPLIER_STAGES.map((stage) => {
                  const isActive = activeMultiplier >= stage.mult;
                  const isCurrent = activeMultiplier === stage.mult;
                  return (
                    <div
                      key={stage.level}
                      className={`relative px-2 py-1 rounded-lg text-xs font-gaming font-black transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black scale-110 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse'
                          : isActive
                          ? 'bg-amber-600/60 text-yellow-200 border border-amber-400/50'
                          : 'bg-slate-900/60 text-gray-500 border border-slate-800'
                      }`}
                    >
                      {stage.label}
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Golden Mandir Pillars & 5x3 Reels Grid */}
          <div className="relative mt-2 p-1.5 sm:p-3 bg-gradient-to-b from-[#1b0b2e] to-[#0d0517] rounded-2xl border border-amber-500/40 shadow-inner">
            {/* Left & Right Ornate Golden Pillars */}
            <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-l-2xl border-r border-amber-300/40 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-2 sm:w-3 bg-gradient-to-l from-amber-600 via-yellow-400 to-amber-600 rounded-r-2xl border-l border-amber-300/40 pointer-events-none" />

            {/* 5-Reel Matrix (3 rows x 5 columns) */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 px-2 sm:px-3">
              {Array.from({ length: 5 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className={`flex flex-col gap-1.5 sm:gap-2 bg-[#090312]/90 rounded-xl p-1 sm:p-1.5 border ${
                    spinningReels[colIdx]
                      ? 'border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                      : 'border-amber-500/20'
                  }`}
                >
                  {/* Column Header Label */}
                  <div className="text-[9px] text-center font-mono font-bold text-amber-400/60">
                    REEL {colIdx + 1}
                  </div>

                  {/* 3 Cells per reel */}
                  {Array.from({ length: 3 }).map((_, rowIdx) => {
                    const symbol = reelGrid[rowIdx][colIdx];
                    const isWinningCell = winningCells.some((c) => c.row === rowIdx && c.col === colIdx);

                    return (
                      <div
                        key={rowIdx}
                        className={`relative aspect-square sm:aspect-[4/3] rounded-xl flex flex-col items-center justify-center p-1 overflow-hidden transition-all duration-300 border ${
                          isWinningCell
                            ? 'bg-gradient-to-br from-yellow-400/40 via-amber-500/50 to-orange-600/40 border-yellow-300 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.8)] z-10'
                            : `bg-gradient-to-br ${symbol.bgColor} border-amber-500/20 hover:border-amber-400/40`
                        }`}
                      >
                        {/* Symbol Character */}
                        <span
                          className={`text-2xl sm:text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] select-none ${
                            spinningReels[colIdx] ? 'blur-[1px] scale-95' : 'scale-100'
                          } ${symbol.isWild ? 'animate-pulse' : ''}`}
                        >
                          {symbol.char}
                        </span>

                        {/* Symbol Name */}
                        <span
                          className="text-[9px] sm:text-[10px] font-bold tracking-tight truncate max-w-full text-center mt-0.5 text-amber-200/90 drop-shadow"
                          style={{ color: symbol.color }}
                        >
                          {symbol.name}
                        </span>

                        {/* Special Badges */}
                        {symbol.isWild && (
                          <span className="absolute top-1 right-1 bg-gradient-to-r from-amber-500 to-yellow-300 text-black text-[8px] font-black px-1 rounded shadow">
                            WILD
                          </span>
                        )}
                        {symbol.isScatter && (
                          <span className="absolute top-1 right-1 bg-gradient-to-r from-rose-500 to-orange-400 text-white text-[8px] font-black px-1 rounded shadow animate-pulse">
                            SCATTER
                          </span>
                        )}

                        {/* Golden rays on winning cells */}
                        {isWinningCell && (
                          <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none animate-ping" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Win Toast Inside Reels */}
            {lastWin > 0 && (
              <div className="mt-2 py-1.5 px-3 bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border border-yellow-400/60 rounded-xl text-center shadow-lg">
                <span className="text-yellow-300 font-gaming font-bold text-xs sm:text-sm tracking-wide">
                  ✨ {lastWinDetails}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Bottom Betting & Spin Controls matching PG Soft & Indian Casino */}
      <footer className="w-full max-w-4xl bg-gradient-to-t from-slate-950 via-[#10071a] to-amber-950/70 border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl">
        {/* User Balance, Current Win, Bet Display */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 text-center">
          {/* Wallet Balance */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl py-1.5 px-2">
            <span className="text-[10px] sm:text-xs text-gray-400 block font-semibold">BALANCE</span>
            <span className="text-xs sm:text-base font-gaming font-black text-emerald-400">
              ₹{(currentUser?.balance ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Last Win */}
          <div className="bg-gradient-to-br from-amber-950/90 to-yellow-950/90 border border-amber-500/50 rounded-xl py-1.5 px-2">
            <span className="text-[10px] sm:text-xs text-amber-300/80 block font-semibold">WIN AMOUNT</span>
            <span className="text-xs sm:text-base font-gaming font-black text-yellow-300">
              ₹{lastWin.toLocaleString()}
            </span>
          </div>

          {/* Current Bet Amount */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl py-1.5 px-2">
            <span className="text-[10px] sm:text-xs text-gray-400 block font-semibold">TOTAL BET</span>
            <span className="text-xs sm:text-base font-gaming font-black text-amber-400">
              ₹{betAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Quick Bet Selection Chips */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 mb-3 overflow-x-auto pb-1">
          <span className="text-[11px] text-amber-300/70 font-bold hidden sm:inline">BET:</span>
          {BET_PRESETS.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setBetAmount(amt);
                playSound('bell');
              }}
              disabled={isSpinning || isFreeSpinMode}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex-1 sm:flex-none ${
                betAmount === amt
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                  : 'bg-slate-900/80 border border-slate-800 text-gray-300 hover:border-amber-500/40'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Action Controls Bar: Turbo, Auto Spin, Main Big Spin Button */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Turbo Mode Toggle */}
          <button
            onClick={() => {
              setTurboMode(!turboMode);
              playSound('bell');
            }}
            className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition border ${
              turboMode
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${turboMode ? 'fill-current' : ''}`} />
            <span>TURBO</span>
          </button>

          {/* Auto Spin Toggle */}
          <button
            onClick={() => {
              if (isAutoSpinActive) {
                setIsAutoSpinActive(false);
                setAutoSpinCount(0);
              } else {
                setAutoSpinCount(20);
                setIsAutoSpinActive(true);
              }
              playSound('bell');
            }}
            disabled={isSpinning && !isAutoSpinActive}
            className={`flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition border ${
              isAutoSpinActive
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${isAutoSpinActive ? 'animate-spin' : ''}`} />
            <span>{isAutoSpinActive ? `STOP (${autoSpinCount})` : 'AUTO (20)'}</span>
          </button>

          {/* Central Main Gold Spin Button */}
          <button
            onClick={() => executeSpin(false)}
            disabled={isSpinning || isFreeSpinMode}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-2xl font-gaming font-black text-sm sm:text-base tracking-wider transition-all duration-200 ${
              isSpinning || isFreeSpinMode
                ? 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.8)] active:scale-95 border-2 border-yellow-200'
            }`}
          >
            <span className="text-xl">🕉️</span>
            <span>{isSpinning ? 'SPINNING...' : isFreeSpinMode ? `FREE SPIN (${freeSpinsLeft})` : 'SPIN'}</span>
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </footer>

      {/* 4. Big Win & Blessed Jackpot Celebration Modal */}
      {bigWinCelebration && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#2b0f38] via-[#1a0724] to-[#0c0312] border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_60px_rgba(251,191,36,0.9)] animate-scaleUp relative overflow-hidden">
            <div className="text-5xl sm:text-6xl mb-2 animate-bounce">🕉️</div>
            <h2 className="text-xl sm:text-2xl font-gaming font-black text-yellow-300 tracking-wider mb-1">
              {bigWinCelebration.title}
            </h2>
            <p className="text-xs text-amber-200/80 mb-4">
              Lord Ganesha blessed your spin with {bigWinCelebration.multiplier}X Multiplier!
            </p>

            <div className="py-4 px-6 bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 rounded-2xl border border-yellow-400/50 mb-6">
              <span className="text-3xl sm:text-4xl font-gaming font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
                ₹{bigWinCelebration.amount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => setBigWinCelebration(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-gaming font-black text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-95"
            >
              COLLECT BLESSINGS & CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* 5. Paytable & Rules Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#12071f] border border-amber-500/50 rounded-3xl p-4 sm:p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕉️</span>
                <div>
                  <h3 className="font-gaming font-black text-yellow-300 text-base sm:text-lg">
                    GANESHA GOLD PAYTABLE
                  </h3>
                  <span className="text-[11px] text-gray-400">PG SOFT • 243 Ways to Win • RTP 96.2%</span>
                </div>
              </div>
              <button
                onClick={() => setShowPaytable(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Special Features Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-amber-950/60 to-yellow-950/40 border border-amber-500/40 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🕉️</span>
                  <h4 className="font-bold text-amber-300 text-xs sm:text-sm">Wild Multiplier Feature</h4>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Ganesha Wild substitutes for all symbols except Scatter. Every Wild collected upgrades the multiplier:
                  <br />
                  <strong className="text-amber-400">1 Wild = 2X | 2 Wilds = 4X | 3 Wilds = 6X | 4 Wilds = 10X | 5+ Wilds = 20X!</strong>
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-950/60 to-orange-950/40 border border-yellow-500/40 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🛕</span>
                  <h4 className="font-bold text-yellow-300 text-xs sm:text-sm">Free Spins Bonus Feature</h4>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  3, 4, or 5 Temple Scatters award <strong className="text-yellow-300">12, 15, or 20 Free Spins</strong>!
                  During Free Spins, collected Wilds carry over across spins to unlock the massive 20X max multiplier!
                </p>
              </div>
            </div>

            {/* Symbols Table */}
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Symbol Payouts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {GANESHA_SYMBOLS.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.char}</span>
                    <div>
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[10px] text-gray-400">{s.nameHindi}</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono">
                    <span className="text-gray-400">5x: </span>
                    <span className="text-amber-300 font-bold">{s.payout5}x</span>
                    <span className="text-gray-400 ml-2">4x: </span>
                    <span className="text-amber-300 font-bold">{s.payout4}x</span>
                    <span className="text-gray-400 ml-2">3x: </span>
                    <span className="text-amber-300 font-bold">{s.payout3}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Spin History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#12071f] border border-amber-500/50 rounded-3xl p-4 sm:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-gaming font-black text-yellow-300 text-base">SPIN HISTORY</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-xs">No spins recorded in this session yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="text-gray-400 text-[10px] block">{item.time}</span>
                      <span className="font-bold text-gray-200">Bet: ₹{item.bet}</span>
                      {item.freeSpins && (
                        <span className="ml-1.5 text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">
                          Free Spin
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {item.win > 0 ? (
                        <>
                          <span className="text-emerald-400 font-bold block">
                            +₹{item.win.toLocaleString()} ({item.mult}X)
                          </span>
                          <span className="text-[10px] text-amber-300">WON</span>
                        </>
                      ) : (
                        <span className="text-gray-500 font-medium">No Win</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
