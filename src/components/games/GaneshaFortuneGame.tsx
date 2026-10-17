import React, { useState, useEffect, useRef } from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Info,
  History,
  Coins,
  Shield,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FortuneSymbol {
  id: string;
  char: string;
  name: string;
  nameHindi: string;
  payout: number;
  isWild?: boolean;
  isScatter?: boolean;
  frame?: 'none' | 'silver' | 'gold';
  bgColor: string;
  color: string;
  imageAlt?: string;
}

// Authentic PG Soft Ganesha Fortune Symbols matching Screenshot
const BASE_SYMBOLS: FortuneSymbol[] = [
  {
    id: 'wild',
    char: '🐘',
    name: 'Wild Ganesha',
    nameHindi: 'वाइल्ड गणेश',
    payout: 50,
    isWild: true,
    bgColor: 'from-amber-400/30 to-yellow-600/40 border-amber-400',
    color: '#fbbf24',
  },
  {
    id: 'scatter',
    char: '🐭',
    name: 'Mooshak Scatter',
    nameHindi: 'मूषक स्कैटर',
    payout: 100,
    isScatter: true,
    bgColor: 'from-rose-500/30 to-amber-600/40 border-yellow-300',
    color: '#f43f5e',
  },
  {
    id: 'prince',
    char: '👨🏽',
    name: 'Royal Prince',
    nameHindi: 'राजकुमार',
    payout: 40,
    bgColor: 'from-amber-600/20 to-orange-700/30 border-amber-500/50',
    color: '#f59e0b',
  },
  {
    id: 'princess',
    char: '👸🏽',
    name: 'Royal Princess',
    nameHindi: 'राजकुमारी',
    payout: 35,
    bgColor: 'from-purple-600/20 to-pink-700/30 border-pink-500/50',
    color: '#ec4899',
  },
  {
    id: 'cow',
    char: '🐄',
    name: 'Sacred Nandi',
    nameHindi: 'पवित्र नंदी',
    payout: 30,
    bgColor: 'from-orange-500/20 to-amber-700/30 border-orange-400/50',
    color: '#f97316',
  },
  {
    id: 'diya',
    char: '🪔',
    name: '3-Flame Diya',
    nameHindi: 'आरती दीप',
    payout: 25,
    bgColor: 'from-blue-600/20 to-cyan-700/30 border-blue-400/50',
    color: '#06b6d4',
  },
  {
    id: 'basket',
    char: '🧺',
    name: 'Flower Garland',
    nameHindi: 'पुष्प माला टोकरी',
    payout: 20,
    bgColor: 'from-emerald-600/20 to-teal-700/30 border-emerald-400/50',
    color: '#10b981',
  },
  {
    id: 'turmeric',
    char: '🥣',
    name: 'Haldi Kumkum',
    nameHindi: 'हल्दी कुमकुम',
    payout: 15,
    bgColor: 'from-yellow-600/20 to-amber-700/30 border-yellow-400/50',
    color: '#eab308',
  },
  {
    id: 'ace',
    char: 'A',
    name: 'Royal A',
    nameHindi: 'A',
    payout: 10,
    bgColor: 'from-purple-700/20 to-indigo-800/20 border-purple-400/40',
    color: '#c084fc',
  },
  {
    id: 'king',
    char: 'K',
    name: 'Royal K',
    nameHindi: 'K',
    payout: 8,
    bgColor: 'from-blue-700/20 to-cyan-800/20 border-blue-400/40',
    color: '#60a5fa',
  },
  {
    id: 'queen',
    char: 'Q',
    name: 'Royal Q',
    nameHindi: 'Q',
    payout: 6,
    bgColor: 'from-teal-700/20 to-emerald-800/20 border-teal-400/40',
    color: '#2dd4bf',
  },
  {
    id: 'jack',
    char: 'J',
    name: 'Royal J',
    nameHindi: 'J',
    payout: 5,
    bgColor: 'from-lime-700/20 to-green-800/20 border-lime-400/40',
    color: '#a3e635',
  },
  {
    id: 'ten',
    char: '10',
    name: 'Royal 10',
    nameHindi: '10',
    payout: 4,
    bgColor: 'from-amber-700/20 to-orange-800/20 border-amber-400/40',
    color: '#fb923c',
  },
];

// Generates a random symbol with potential Silver / Gold frames
const getRandomSymbol = (isTopReel = false): FortuneSymbol => {
  const pool = isTopReel
    ? BASE_SYMBOLS.filter((s) => !s.isScatter)
    : BASE_SYMBOLS;

  const base = pool[Math.floor(Math.random() * pool.length)];
  let frame: 'none' | 'silver' | 'gold' = 'none';

  if (!base.isWild && !base.isScatter) {
    const frameRoll = Math.random();
    if (frameRoll < 0.15) frame = 'gold';
    else if (frameRoll < 0.35) frame = 'silver';
  }

  return { ...base, frame };
};

export const GaneshaFortuneGame: React.FC = () => {
  const {
    closeGame,
    currentUser,
    updateUserBalance,
    placeBet,
    settleBet,
    openDeposit,
    showToast,
  } = useGaming();

  // Live Clock (matching top right "23:48:46" in screenshot)
  const [currentTime, setCurrentTime] = useState<string>('23:48:46');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toTimeString().split(' ')[0]
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ways to Win: Dynamic Megaways (e.g., 10800 Ways as in screenshot)
  const [waysCount, setWaysCount] = useState<number>(10800);

  // Horizontal Extra Top Reel (Reels 2, 3, 4, 5 -> 4 symbols)
  const [topReel, setTopReel] = useState<FortuneSymbol[]>(() => [
    { ...BASE_SYMBOLS[2], frame: 'none' }, // Prince
    { ...BASE_SYMBOLS[0], frame: 'none' }, // Wild
    { ...BASE_SYMBOLS[4], frame: 'silver' }, // Cow
    { ...BASE_SYMBOLS[3], frame: 'none' }, // Princess
  ]);

  // 6 Main Vertical Reels (each with 5 symbols)
  const [reels, setReels] = useState<FortuneSymbol[][]>(() =>
    Array.from({ length: 6 }, () =>
      Array.from({ length: 5 }, () => getRandomSymbol())
    )
  );

  // Spinning states
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>(Array(6).fill(false));
  const [isTopReelSpinning, setIsTopReelSpinning] = useState(false);

  // Betting states (Default ₹18.00 matching screenshot!)
  const [betAmount, setBetAmount] = useState<number>(18);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinActive, setIsAutoSpinActive] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(false);

  // Free Spins & Feature Buy
  const [isFreeSpinMode, setIsFreeSpinMode] = useState(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [freeSpinWinTotal, setFreeSpinWinTotal] = useState(0);
  const [freeSpinMultiplier, setFreeSpinMultiplier] = useState(3);
  const [showFeatureBuyModal, setShowFeatureBuyModal] = useState(false);

  // Win presentation
  const [lastWin, setLastWin] = useState<number>(0);
  const [lastWinDetails, setLastWinDetails] = useState<string>('');
  const [winningCells, setWinningCells] = useState<Array<{ reel: number; row: number }>>([]);
  const [bigWinCelebration, setBigWinCelebration] = useState<{
    amount: number;
    title: string;
  } | null>(null);

  // History & Paytable Modals
  const [showPaytable, setShowPaytable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [spinHistory, setSpinHistory] = useState<
    Array<{ id: string; bet: number; win: number; time: string; ways: number }>
  >([]);

  // Web Audio Synthesizer (Zero external audio assets required)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'spin' | 'stop' | 'wild' | 'scatter' | 'win' | 'superwin' | 'click') => {
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

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'spin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'stop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'wild') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.12, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.32);
        });
      } else if (type === 'scatter') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'win') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.15, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.38);
        });
      } else if (type === 'superwin') {
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.18, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.65);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  // Execute Spin (Base Game or Free Spin)
  const executeSpin = (isFreeSpin = false) => {
    if (isSpinning) return;

    if (!currentUser) {
      showToast('Please Login or Signup to play Ganesha Fortune with real cash!');
      return;
    }

    if (!isFreeSpin && currentUser.balance < betAmount) {
      showToast('Insufficient balance! Please Deposit to spin Ganesha Fortune.');
      openDeposit();
      setIsAutoSpinActive(false);
      setAutoSpinCount(0);
      return;
    }

    // Deduct bet if not a free spin
    if (!isFreeSpin) {
      updateUserBalance(-betAmount);
      placeBet({
        gameId: 'ganesha-fortune',
        gameName: 'GANESHA FORTUNE',
        amount: betAmount,
        multiplier: 1.0,
        payout: 0,
        status: 'PENDING',
        betType: 'casino',
        details: `Ganesha Fortune Spin (₹${betAmount})`,
      });
    } else {
      setFreeSpinsRemaining((prev) => Math.max(0, prev - 1));
    }

    setIsSpinning(true);
    setWinningCells([]);
    setLastWin(0);
    setLastWinDetails('');
    setBigWinCelebration(null);
    setSpinningReels(Array(6).fill(true));
    setIsTopReelSpinning(true);
    playSound('spin');

    // Dynamic Ways simulation (Megaways)
    const newWays = Math.floor(Math.random() * 8000) + 4000;
    setWaysCount(newWays);

    // Continuous reel shuffle during spin
    const spinInterval = setInterval(() => {
      setTopReel(Array.from({ length: 4 }, () => getRandomSymbol(true)));
      setReels(
        Array.from({ length: 6 }, () =>
          Array.from({ length: 5 }, () => getRandomSymbol())
        )
      );
    }, 60);

    const baseDuration = turboMode ? 450 : 900;

    // Sequential reel stops
    for (let r = 0; r < 6; r++) {
      const delay = baseDuration + r * (turboMode ? 70 : 160);
      setTimeout(() => {
        setSpinningReels((prev) => {
          const next = [...prev];
          next[r] = false;
          return next;
        });
        playSound('stop');
      }, delay);
    }

    // Top reel stops with reel 3
    setTimeout(() => {
      setIsTopReelSpinning(false);
    }, baseDuration + 3 * (turboMode ? 70 : 160));

    const totalSpinTime = baseDuration + 6 * (turboMode ? 70 : 160) + 100;

    setTimeout(() => {
      clearInterval(spinInterval);

      // Construct final grid
      const isWinner = Math.random() < (isFreeSpin ? 0.65 : 0.44);
      const scatterCount = Math.random() < 0.09 ? 4 : Math.random() < 0.25 ? 2 : 1;

      const finalTopReel: FortuneSymbol[] = Array.from({ length: 4 }, () =>
        getRandomSymbol(true)
      );
      const finalReels: FortuneSymbol[][] = Array.from({ length: 6 }, () =>
        Array.from({ length: 5 }, () => getRandomSymbol())
      );

      const hitCells: Array<{ reel: number; row: number }> = [];
      let payout = 0;
      let winningSymbolName = '';

      if (isWinner) {
        // Pick winning symbol
        const candidates = BASE_SYMBOLS.filter((s) => !s.isScatter);
        const winSymbol = candidates[Math.floor(Math.random() * candidates.length)];
        winningSymbolName = winSymbol.name;

        // Choose hit length: 3, 4, 5, or 6 reels
        const hitLength = Math.random() < 0.15 ? 6 : Math.random() < 0.35 ? 5 : Math.random() < 0.6 ? 4 : 3;

        for (let reelIdx = 0; reelIdx < hitLength; reelIdx++) {
          const rowChoice = Math.floor(Math.random() * 5);
          // Occasional Wild-on-the-Way replacement
          const isWild = Math.random() < 0.3;
          if (isWild) {
            finalReels[reelIdx][rowChoice] = { ...BASE_SYMBOLS[0], frame: 'none' };
          } else {
            finalReels[reelIdx][rowChoice] = { ...winSymbol, frame: 'none' };
          }
          hitCells.push({ reel: reelIdx, row: rowChoice });
        }

        // Top reel matches
        if (hitLength >= 4 && Math.random() < 0.4) {
          finalTopReel[1] = { ...BASE_SYMBOLS[0], frame: 'none' }; // Wild
        }

        // Calculate payout based on hit length
        const multFactor = hitLength === 6 ? 6 : hitLength === 5 ? 4 : hitLength === 4 ? 2.5 : 1.5;
        payout = Math.round(betAmount * (winSymbol.payout / 15) * multFactor * (isFreeSpin ? freeSpinMultiplier : 1));
      }

      // Add Scatter symbols if triggered
      if (scatterCount >= 4) {
        for (let s = 0; s < 4; s++) {
          finalReels[s + 1][s % 4] = { ...BASE_SYMBOLS[1], frame: 'none' };
          hitCells.push({ reel: s + 1, row: s % 4 });
        }
      }

      setTopReel(finalTopReel);
      setReels(finalReels);

      // Check Scatters for Free Spins (4 Scatters = 8 Free Spins!)
      if (scatterCount >= 4) {
        playSound('scatter');
        setFreeSpinsRemaining((prev) => prev + 8);
        setIsFreeSpinMode(true);
        setFreeSpinMultiplier((prev) => prev + 3);
        showToast('🛕 4 MOOSHAK SCATTERS! 8 Free Spins Triggered with Increasing Multipliers!');
      }

      // Settlement
      if (isWinner && payout > 0) {
        setLastWin(payout);
        setWinningCells(hitCells);
        setLastWinDetails(
          `${winningSymbolName} Hit! ${newWays.toLocaleString()} Ways Paid ₹${payout.toLocaleString()}`
        );

        updateUserBalance(payout);
        settleBet('ganesha-fortune-spin', true, payout / betAmount);

        if (isFreeSpinMode) {
          setFreeSpinWinTotal((prev) => prev + payout);
        }

        const winRatio = payout / betAmount;
        if (winRatio >= 15) {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#10b981'],
          });
          playSound('superwin');
          setBigWinCelebration({
            amount: payout,
            title: winRatio >= 50 ? '👑 GANESHA FORTUNE MEGA WIN 👑' : '✨ BLESSED SUPER WIN ✨',
          });
        } else {
          playSound('win');
        }

        setSpinHistory((prev) => [
          {
            id: `spin-${Date.now()}`,
            bet: betAmount,
            win: payout,
            ways: newWays,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...prev.slice(0, 19),
        ]);
      } else {
        settleBet('ganesha-fortune-spin', false);
        setSpinHistory((prev) => [
          {
            id: `spin-${Date.now()}`,
            bet: betAmount,
            win: 0,
            ways: newWays,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...prev.slice(0, 19),
        ]);
      }

      setIsSpinning(false);
    }, totalSpinTime);
  };

  // Feature Buy Execution
  const buyFeature = () => {
    const cost = betAmount * 75;
    if (!currentUser || currentUser.balance < cost) {
      showToast(`Insufficient balance! Feature Buy requires ₹${cost.toLocaleString()}.`);
      openDeposit();
      return;
    }
    updateUserBalance(-cost);
    setShowFeatureBuyModal(false);
    setIsFreeSpinMode(true);
    setFreeSpinsRemaining(8);
    setFreeSpinMultiplier(3);
    setFreeSpinWinTotal(0);
    showToast(`🎉 FEATURE BOUGHT: 8 Free Spins with 3X Multiplier activated!`);
    playSound('superwin');
  };

  // Auto Spin loop & Free Spins loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning) {
      if (isFreeSpinMode && freeSpinsRemaining > 0) {
        timer = setTimeout(() => {
          executeSpin(true);
        }, turboMode ? 550 : 1100);
      } else if (isFreeSpinMode && freeSpinsRemaining === 0) {
        setIsFreeSpinMode(false);
        showToast(`🎉 Free Spins Round Complete! Total Fortune Won: ₹${freeSpinWinTotal.toLocaleString()}`);
        setFreeSpinWinTotal(0);
      } else if (isAutoSpinActive && autoSpinCount > 0) {
        timer = setTimeout(() => {
          setAutoSpinCount((prev) => prev - 1);
          executeSpin(false);
        }, turboMode ? 450 : 900);
      } else if (isAutoSpinActive && autoSpinCount === 0) {
        setIsAutoSpinActive(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isSpinning, isAutoSpinActive, autoSpinCount, isFreeSpinMode, freeSpinsRemaining]);

  // Bet adjusters
  const increaseBet = () => {
    const presets = [1.8, 3.6, 9, 18, 36, 90, 180, 360, 900, 1800];
    const currentIndex = presets.findIndex((p) => p >= betAmount);
    if (currentIndex < presets.length - 1) {
      setBetAmount(presets[currentIndex + 1]);
      playSound('click');
    }
  };

  const decreaseBet = () => {
    const presets = [1.8, 3.6, 9, 18, 36, 90, 180, 360, 900, 1800];
    const currentIndex = presets.findLastIndex((p) => p <= betAmount);
    if (currentIndex > 0) {
      setBetAmount(presets[currentIndex - 1]);
      playSound('click');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e071a] flex flex-col justify-between overflow-y-auto select-none font-sans animate-fadeIn">
      {/* 1. Top Bar: Game Title & Live Clock (Matching Screenshot) */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-amber-950/70 via-purple-950/80 to-amber-950/70 border-b border-amber-500/30 text-xs">
        {/* Left: Ganesha Fortune Title */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide drop-shadow">
            Ganesha Fortune
          </span>
          <span className="bg-amber-500/30 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-400/40">
            PG SOFT
          </span>
        </div>

        {/* Right: Live Digital Clock & Close/Mute Controls */}
        <div className="flex items-center gap-2 text-gray-200">
          <span className="font-mono text-xs text-amber-200 font-bold tracking-wider">
            {currentTime}
          </span>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded bg-black/40 text-amber-300 hover:text-white"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
          </button>

          <button
            onClick={() => setShowPaytable(true)}
            className="p-1 rounded bg-black/40 text-amber-300 hover:text-white"
            title="Paytable"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="p-1 rounded bg-black/40 text-amber-300 hover:text-white"
            title="History"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={closeGame}
            className="p-1 rounded bg-rose-950/80 text-rose-300 hover:text-white ml-1"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Golden Shrine Header & Ways Banner (Matching Screenshot "10800 WAYS") */}
      <div className="w-full max-w-lg mx-auto px-2 pt-1 flex flex-col items-center">
        {/* Ornate Golden Mandir Arch */}
        <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-t-xl p-0.5 shadow-md">
          <div className="bg-gradient-to-b from-amber-100 to-amber-200 text-center py-1 rounded-t-[10px] border border-amber-600/40 shadow-inner">
            <span className="font-gaming font-black text-xs sm:text-sm text-red-600 tracking-widest drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
              {waysCount.toLocaleString()} WAYS
            </span>
            {isFreeSpinMode && (
              <span className="ml-2 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse">
                FREE SPINS: {freeSpinsRemaining} LEFT ({freeSpinMultiplier}X)
              </span>
            )}
          </div>
        </div>

        {/* 4-Symbol Horizontal Extra Top Reel (Reels 2, 3, 4, 5) */}
        <div className="w-[66.6%] bg-gradient-to-r from-amber-900/90 via-yellow-950 to-amber-900/90 border-x-2 border-b-2 border-amber-400/80 grid grid-cols-4 gap-1 p-1 rounded-b-lg shadow-lg">
          {topReel.map((sym, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-md flex flex-col items-center justify-center p-0.5 overflow-hidden transition-all duration-200 border ${
                sym.frame === 'gold'
                  ? 'border-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.9)] bg-gradient-to-br from-yellow-500/40 to-amber-700/50'
                  : sym.frame === 'silver'
                  ? 'border-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.7)] bg-gradient-to-br from-slate-400/30 to-slate-700/40'
                  : 'border-amber-400/30 bg-gradient-to-br from-[#2a133d] to-[#12071f]'
              }`}
            >
              <span
                className={`text-xl sm:text-2xl drop-shadow select-none ${
                  isTopReelSpinning ? 'blur-[1px] scale-95' : 'scale-100'
                }`}
              >
                {sym.char}
              </span>
              <span
                className="text-[8px] font-black uppercase tracking-tighter truncate max-w-full drop-shadow"
                style={{ color: sym.color }}
              >
                {sym.isWild ? 'WILD' : sym.char === 'A' || sym.char === 'K' || sym.char === 'Q' || sym.char === 'J' || sym.char === '10' ? sym.char : sym.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main 6-Reel Grid Area (Matching Screenshot) */}
      <div className="w-full max-w-lg mx-auto px-2 flex-1 flex flex-col justify-center my-1">
        <div className="bg-gradient-to-b from-[#200a33] via-[#140624] to-[#1a082b] border-2 border-amber-400/80 rounded-2xl p-1.5 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          {/* 6 Columns Grid */}
          <div className="grid grid-cols-6 gap-1">
            {reels.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`flex flex-col gap-1 rounded-lg p-0.5 transition-all ${
                  spinningReels[colIdx]
                    ? 'border border-amber-400/80 bg-amber-950/20 shadow-inner'
                    : 'bg-black/30'
                }`}
              >
                {col.map((sym, rowIdx) => {
                  const isWinning = winningCells.some(
                    (c) => c.reel === colIdx && c.row === rowIdx
                  );

                  return (
                    <div
                      key={rowIdx}
                      className={`relative aspect-[3/4] sm:aspect-square rounded-lg flex flex-col items-center justify-center p-0.5 overflow-hidden transition-all duration-200 border ${
                        isWinning
                          ? 'border-yellow-300 bg-gradient-to-br from-yellow-400/50 via-amber-500/60 to-orange-600/50 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.9)] z-10'
                          : sym.frame === 'gold'
                          ? 'border-2 border-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.8)] bg-gradient-to-br from-yellow-500/30 to-amber-800/40'
                          : sym.frame === 'silver'
                          ? 'border-2 border-slate-300 shadow-[0_0_8px_rgba(226,232,240,0.6)] bg-gradient-to-br from-slate-400/25 to-slate-800/40'
                          : 'border-amber-500/20 bg-gradient-to-br from-[#230d38]/80 to-[#0e0417]/90'
                      }`}
                    >
                      {/* Symbol Icon Character */}
                      <span
                        className={`text-xl sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none transition-transform ${
                          spinningReels[colIdx] ? 'blur-[1px] scale-95' : 'scale-100'
                        } ${sym.isWild ? 'animate-pulse' : ''}`}
                      >
                        {sym.char}
                      </span>

                      {/* Symbol Name / Badge */}
                      <span
                        className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter truncate max-w-full drop-shadow text-center"
                        style={{ color: sym.color }}
                      >
                        {sym.isWild ? 'WILD' : sym.isScatter ? 'SCATTER' : sym.name}
                      </span>

                      {/* Wild / Scatter Overlays */}
                      {sym.isWild && (
                        <span className="absolute top-0.5 right-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[6px] font-black px-0.5 rounded">
                          WILD
                        </span>
                      )}
                      {sym.isScatter && (
                        <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[6px] font-black px-0.5 rounded animate-pulse">
                          SCATTER
                        </span>
                      )}

                      {/* Silver / Gold Frame Indicator Label */}
                      {sym.frame === 'gold' && (
                        <span className="absolute bottom-0 inset-x-0 bg-yellow-400/80 text-black text-[6px] font-black text-center">
                          GOLD
                        </span>
                      )}
                      {sym.frame === 'silver' && (
                        <span className="absolute bottom-0 inset-x-0 bg-slate-300/80 text-black text-[6px] font-black text-center">
                          SILVER
                        </span>
                      )}

                      {/* Win Glow pulse */}
                      {isWinning && (
                        <div className="absolute inset-0 bg-yellow-400/20 animate-ping pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win Announcement Ribbon */}
          {lastWin > 0 && (
            <div className="mt-1.5 py-1 px-2 bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border border-yellow-400/80 rounded-xl text-center shadow-lg animate-bounce">
              <span className="text-yellow-300 font-gaming font-black text-xs sm:text-sm tracking-wider">
                ✨ {lastWinDetails}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. "WITH WILDS-ON-THE-WAY!" Ribbon & FEATURE BUY Button (Matching Screenshot) */}
      <div className="w-full max-w-lg mx-auto px-2 space-y-1.5 my-1">
        {/* Ornate Purple & Gold Ribbon Banner */}
        <div className="bg-gradient-to-r from-[#380e52] via-[#52136e] to-[#380e52] border-2 border-amber-400/70 rounded-xl py-1 px-3 text-center shadow-md flex items-center justify-center gap-2">
          <span className="bg-amber-400 text-black text-[10px] font-black px-1 rounded shadow">
            🐘 Wild
          </span>
          <span className="font-gaming font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-300 tracking-wider">
            WITH WILDS-ON-THE-WAY!
          </span>
        </div>

        {/* FEATURE BUY Button (Exact match from Screenshot) */}
        <button
          onClick={() => setShowFeatureBuyModal(true)}
          disabled={isSpinning || isFreeSpinMode}
          className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-gaming font-black text-sm tracking-wider rounded-xl border-2 border-yellow-100 shadow-[0_0_15px_rgba(245,158,11,0.6)] active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-current text-purple-900" />
          <span>FEATURE BUY (₹{(betAmount * 75).toLocaleString()})</span>
        </button>
      </div>

      {/* 5. Bottom PG Soft Console (Matching Screenshot Exactly) */}
      <div className="w-full max-w-lg mx-auto px-2 pb-2">
        <div className="bg-gradient-to-b from-[#2a0c40] via-[#1d072e] to-[#12031f] border border-amber-500/50 rounded-2xl p-2.5 sm:p-3 shadow-2xl space-y-2.5">
          {/* Row 1: Balance Pill, PG Logo Pill, Bet Pill (Matching Screenshot) */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Left Pill: User icon + Balance */}
            <div className="bg-[#10041d] border border-amber-500/30 rounded-xl py-1 px-2 flex items-center justify-center gap-1.5">
              <span className="text-amber-400 text-xs">👤</span>
              <span className="font-mono font-bold text-gray-100 text-xs sm:text-sm">
                ₹{(currentUser?.balance ?? 0).toLocaleString()}
              </span>
            </div>

            {/* Center Pill: PG Logo */}
            <div className="bg-[#10041d] border border-amber-500/30 rounded-xl py-1 px-2 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="font-gaming font-black text-amber-300 text-xs tracking-wider">
                PG
              </span>
            </div>

            {/* Right Pill: Bet Amount */}
            <div className="bg-[#10041d] border border-amber-500/30 rounded-xl py-1 px-2 flex items-center justify-center gap-1.5">
              <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
                ₹{betAmount.toFixed(2)}
              </span>
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          {/* Row 2: Action Controls (⚡, −, Golden Dual-Arrow Spin, +, ▷) */}
          <div className="flex items-center justify-between gap-2 px-1">
            {/* Turbo Toggle ⚡ */}
            <button
              onClick={() => {
                setTurboMode(!turboMode);
                playSound('click');
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
                turboMode
                  ? 'bg-amber-400 text-black border-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                  : 'bg-[#140624] border-purple-800 text-gray-400 hover:text-white'
              }`}
              title="Turbo Mode"
            >
              <Zap className={`w-4 h-4 ${turboMode ? 'fill-current' : ''}`} />
            </button>

            {/* Minus Button − */}
            <button
              onClick={decreaseBet}
              disabled={isSpinning || isFreeSpinMode}
              className="w-10 h-10 rounded-full bg-[#140624] border border-purple-800 text-amber-300 text-lg font-bold hover:bg-purple-900/60 active:scale-95 transition flex items-center justify-center"
              title="Decrease Bet"
            >
              −
            </button>

            {/* Main Central Golden Dual-Arrow SPIN Button (Matching Screenshot) */}
            <button
              onClick={() => executeSpin(false)}
              disabled={isSpinning || isFreeSpinMode}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.8)] active:scale-95 transition flex items-center justify-center ${
                isSpinning ? 'opacity-80 cursor-wait' : ''
              }`}
              title="Spin"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7a1827] via-[#941d30] to-[#59101c] flex items-center justify-center border-2 border-yellow-300">
                <RotateCcw
                  className={`w-8 h-8 text-amber-300 transition-transform ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                />
              </div>
            </button>

            {/* Plus Button + */}
            <button
              onClick={increaseBet}
              disabled={isSpinning || isFreeSpinMode}
              className="w-10 h-10 rounded-full bg-[#140624] border border-purple-800 text-amber-300 text-lg font-bold hover:bg-purple-900/60 active:scale-95 transition flex items-center justify-center"
              title="Increase Bet"
            >
              +
            </button>

            {/* Auto Spin Toggle ▷ */}
            <button
              onClick={() => {
                if (isAutoSpinActive) {
                  setIsAutoSpinActive(false);
                  setAutoSpinCount(0);
                } else {
                  setAutoSpinCount(20);
                  setIsAutoSpinActive(true);
                }
                playSound('click');
              }}
              disabled={isSpinning && !isAutoSpinActive}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
                isAutoSpinActive
                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'bg-[#140624] border-purple-800 text-gray-400 hover:text-white'
              }`}
              title="Auto Spin"
            >
              <span className="font-bold text-xs">
                {isAutoSpinActive ? autoSpinCount : '▶'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Feature Buy Confirmation Modal */}
      {showFeatureBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#2e0e47] via-[#1c072e] to-[#0f031a] border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.8)]">
            <div className="text-4xl mb-2">🛕</div>
            <h3 className="text-lg font-gaming font-black text-yellow-300 tracking-wide mb-1">
              BUY FREE SPINS FEATURE
            </h3>
            <p className="text-xs text-gray-300 mb-4">
              Get <strong className="text-yellow-300">8 Free Spins</strong> with Guaranteed Wilds-on-the-Way & increasing multipliers!
            </p>

            <div className="py-3 px-4 bg-purple-950/80 border border-amber-500/40 rounded-2xl mb-4 text-center">
              <span className="text-xs text-gray-400 block">TOTAL PRICE (75x Bet)</span>
              <span className="text-2xl font-gaming font-black text-amber-300">
                ₹{(betAmount * 75).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFeatureBuyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700"
              >
                CANCEL
              </button>
              <button
                onClick={buyFeature}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-gaming font-black text-xs tracking-wider shadow-lg hover:brightness-110"
              >
                BUY & PLAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Big Win Celebration Modal */}
      {bigWinCelebration && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#380e52] via-[#200633] to-[#0f031a] border-2 border-yellow-300 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_60px_rgba(251,191,36,0.9)] animate-scaleUp">
            <div className="text-5xl mb-2 animate-bounce">🐘 🕉️</div>
            <h2 className="text-xl font-gaming font-black text-yellow-300 tracking-wider mb-1">
              {bigWinCelebration.title}
            </h2>
            <p className="text-xs text-amber-200/80 mb-4">
              May Lord Ganesha bestow unlimited prosperity!
            </p>

            <div className="py-4 px-6 bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 rounded-2xl border border-yellow-400/60 mb-6">
              <span className="text-3xl sm:text-4xl font-gaming font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
                ₹{bigWinCelebration.amount.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => setBigWinCelebration(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-gaming font-black text-sm tracking-wide shadow-lg hover:brightness-110"
            >
              COLLECT FORTUNE
            </button>
          </div>
        </div>
      )}

      {/* 8. Paytable Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#150724] border border-amber-500/50 rounded-3xl p-4 sm:p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐘</span>
                <div>
                  <h3 className="font-gaming font-black text-yellow-300 text-base">
                    GANESHA FORTUNE PAYTABLE
                  </h3>
                  <span className="text-[11px] text-gray-400">PG SOFT • 10,800 Ways • RTP 96.72%</span>
                </div>
              </div>
              <button
                onClick={() => setShowPaytable(false)}
                className="p-1 rounded-xl bg-slate-900 border border-slate-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div className="bg-purple-950/60 border border-amber-500/40 rounded-xl p-3">
                <h4 className="font-bold text-amber-300 text-sm mb-1">Wilds-on-the-Way Feature</h4>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  During any spin, symbols on reels 2, 3, 4, or 5 may appear with a <strong>Silver Frame</strong>. If involved in a win, they transform into a <strong>Gold Framed</strong> symbol. If that Gold Framed symbol wins, it transforms into <strong>Wild Ganesha</strong>!
                </p>
              </div>

              <div className="bg-yellow-950/60 border border-yellow-500/40 rounded-xl p-3">
                <h4 className="font-bold text-yellow-300 text-sm mb-1">Free Spins Feature</h4>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  4 Mooshak Scatter symbols anywhere award <strong>8 Free Spins</strong>! Each additional Scatter adds +2 spins. Multipliers start at 3x and increase with every win!
                </p>
              </div>
            </div>

            {/* Symbol Payouts List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {BASE_SYMBOLS.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.char}</span>
                    <span className="font-bold text-white">{s.name}</span>
                  </div>
                  <span className="font-mono text-amber-300 font-bold">
                    {s.payout}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#150724] border border-amber-500/50 rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-gaming font-black text-yellow-300 text-base">SPIN HISTORY</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-xl bg-slate-900 border border-slate-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {spinHistory.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-xs">No spins recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {spinHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="text-gray-400 text-[10px] block">{item.time}</span>
                      <span className="font-bold text-gray-200">Bet: ₹{item.bet}</span>
                    </div>
                    <div className="text-right">
                      {item.win > 0 ? (
                        <>
                          <span className="text-emerald-400 font-bold block">
                            +₹{item.win.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono">
                            {item.ways.toLocaleString()} Ways
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">No Win</span>
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
