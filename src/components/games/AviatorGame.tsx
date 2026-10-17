import React, { useState, useEffect, useRef } from 'react';
import { useGaming } from '../../context/GamingContext';
import confetti from 'canvas-confetti';
import { Plane, X, Volume2, VolumeX, Shield, RefreshCw } from 'lucide-react';

export const AviatorGame: React.FC = () => {
  const {
    currentUser,
    placeBet,
    settleBet,
    adminSettings,
    closeGame,
  } = useGaming();

  // Game state: 'WAITING' | 'FLYING' | 'CRASHED'
  const [gameState, setGameState] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [countdown, setCountdown] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.0);
  const [history, setHistory] = useState<number[]>([1.42, 2.85, 1.12, 5.64, 1.05, 12.40, 2.15]);

  // Bet Slip 1
  const [bet1Amount, setBet1Amount] = useState<number>(50);
  const [bet1Active, setBet1Active] = useState<boolean>(false);
  const [bet1Id, setBet1Id] = useState<string | null>(null);
  const [bet1CashedOut, setBet1CashedOut] = useState<boolean>(false);
  const [bet1WinAmount, setBet1WinAmount] = useState<number>(0);

  // Bet Slip 2
  const [bet2Amount, setBet2Amount] = useState<number>(100);
  const [bet2Active, setBet2Active] = useState<boolean>(false);
  const [bet2Id, setBet2Id] = useState<string | null>(null);
  const [bet2CashedOut, setBet2CashedOut] = useState<boolean>(false);
  const [bet2WinAmount, setBet2WinAmount] = useState<number>(0);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Canvas ref for airplane flight trajectory
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine crash point based on admin settings
  const generateCrashPoint = (): number => {
    if (adminSettings.aviatorRigging === 'custom_next' && adminSettings.customNextMultiplier) {
      return adminSettings.customNextMultiplier;
    }
    if (adminSettings.aviatorRigging === 'house_favour') {
      // 60% chance crash under 1.40x
      if (Math.random() < 0.6) {
        return parseFloat((1.01 + Math.random() * 0.38).toFixed(2));
      }
    }
    if (adminSettings.aviatorRigging === 'high_multiplier') {
      // High multipliers
      return parseFloat((3.0 + Math.random() * 15.0).toFixed(2));
    }
    // Fair RTP formula
    const rand = Math.random();
    if (rand < 0.05) return 1.0; // instant crash
    const e = 100 / (100 - 97 * rand);
    return Math.max(1.01, parseFloat(e.toFixed(2)));
  };

  // Game loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === 'WAITING') {
      setMultiplier(1.0);
      setBet1CashedOut(false);
      setBet1WinAmount(0);
      setBet2CashedOut(false);
      setBet2WinAmount(0);

      const targetCrash = generateCrashPoint();
      setCrashPoint(targetCrash);

      let count = 4;
      setCountdown(count);

      timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setGameState('FLYING');
        }
      }, 1000);
    } else if (gameState === 'FLYING') {
      const startTime = Date.now();
      const speed = 0.0006; // flight curve speed

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        // exponential growth: 1.0 * e^(0.06 * seconds)
        const currentMult = parseFloat((Math.exp(elapsed * speed) + (elapsed * 0.0001)).toFixed(2));

        if (currentMult >= crashPoint) {
          clearInterval(interval);
          setMultiplier(crashPoint);
          setGameState('CRASHED');
          setHistory((prev) => [crashPoint, ...prev.slice(0, 15)]);

          // Settle losing bets
          if (bet1Active && !bet1CashedOut && bet1Id) {
            settleBet(bet1Id, false);
            setBet1Active(false);
          }
          if (bet2Active && !bet2CashedOut && bet2Id) {
            settleBet(bet2Id, false);
            setBet2Active(false);
          }
        } else {
          setMultiplier(currentMult);
        }
      }, 50);

      return () => clearInterval(interval);
    } else if (gameState === 'CRASHED') {
      timer = setTimeout(() => {
        setGameState('WAITING');
      }, 2500);
    }

    return () => clearInterval(timer);
  }, [gameState, crashPoint, adminSettings]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (gameState === 'FLYING' || gameState === 'CRASHED') {
        const progress = Math.min(1, (multiplier - 1) / 10);
        const startX = 20;
        const startY = h - 30;
        const endX = startX + progress * (w - 120);
        const endY = startY - Math.pow(progress, 0.8) * (h - 90);

        // Gradient filled curve
        const grad = ctx.createLinearGradient(0, endY, 0, h);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (endX - startX) * 0.5, startY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fill();

        // Glowing red flight curve
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (endX - startX) * 0.5, startY, endX, endY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw animated plane
        ctx.save();
        ctx.translate(endX, endY);
        const angle = -Math.atan2(startY - endY, endX - startX) * 0.6;
        ctx.rotate(angle);

        // Airplane SVG-like drawing
        ctx.fillStyle = '#ffffff';
        ctx.font = '28px sans-serif';
        ctx.fillText(gameState === 'CRASHED' ? '💥' : '✈️', -14, 10);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [gameState, multiplier]);

  // Cash out Bet 1
  const handleCashout1 = () => {
    if (gameState !== 'FLYING' || !bet1Active || bet1CashedOut || !bet1Id) return;
    const win = parseFloat((bet1Amount * multiplier).toFixed(2));
    setBet1WinAmount(win);
    setBet1CashedOut(true);
    setBet1Active(false);
    settleBet(bet1Id, true, multiplier);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  // Place Bet 1
  const handlePlaceBet1 = () => {
    if (!currentUser) return;
    const id = placeBet({
      gameId: 'aviator',
      gameName: 'Aviator',
      amount: bet1Amount,
      multiplier: 1.0,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `Aviator Bet #1: ₹${bet1Amount}`,
    });
    if (id) {
      setBet1Id(id);
      setBet1Active(true);
      setBet1CashedOut(false);
    }
  };

  // Cash out Bet 2
  const handleCashout2 = () => {
    if (gameState !== 'FLYING' || !bet2Active || bet2CashedOut || !bet2Id) return;
    const win = parseFloat((bet2Amount * multiplier).toFixed(2));
    setBet2WinAmount(win);
    setBet2CashedOut(true);
    setBet2Active(false);
    settleBet(bet2Id, true, multiplier);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  // Place Bet 2
  const handlePlaceBet2 = () => {
    if (!currentUser) return;
    const id = placeBet({
      gameId: 'aviator',
      gameName: 'Aviator',
      amount: bet2Amount,
      multiplier: 1.0,
      payout: 0,
      status: 'PENDING',
      betType: 'casino',
      details: `Aviator Bet #2: ₹${bet2Amount}`,
    });
    if (id) {
      setBet2Id(id);
      setBet2Active(true);
      setBet2CashedOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-[#0e1320] border border-red-900/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        {/* Top Header */}
        <div className="bg-[#141b2d] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-gaming font-black text-lg text-white tracking-wider">
              AVIATOR
            </span>
            <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase">
              Originals
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-400 hover:text-white p-1 rounded"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="text-xs text-gray-300 font-mono-num bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
            </div>
            <button
              onClick={closeGame}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multiplier History Bar */}
        <div className="bg-[#0b0f19] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800/80">
          <span className="text-[10px] text-gray-400 uppercase font-bold flex-shrink-0">
            History:
          </span>
          {history.map((h, i) => (
            <span
              key={i}
              className={`text-[11px] font-mono-num font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                h >= 10
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : h >= 2
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Flight Simulation Screen */}
        <div className="relative h-64 sm:h-80 bg-[#090d16] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={320}
            className="w-full h-full absolute inset-0 pointer-events-none"
          />

          {/* Center Multiplier Display */}
          <div className="relative z-10 text-center select-none pointer-events-none">
            {gameState === 'WAITING' ? (
              <div className="space-y-1">
                <div className="text-xs uppercase font-bold text-gray-400 tracking-widest">
                  Next Round Starts In
                </div>
                <div className="text-4xl sm:text-5xl font-black font-gaming text-cyan-400 animate-pulse">
                  00:0{countdown}
                </div>
              </div>
            ) : gameState === 'FLYING' ? (
              <div className="space-y-1">
                <div className="text-5xl sm:text-7xl font-black font-gaming tracking-tighter text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]">
                  {multiplier.toFixed(2)}x
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-in zoom-in-90">
                <div className="text-4xl sm:text-6xl font-black font-gaming text-rose-500 tracking-wider drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]">
                  FLEW AWAY!
                </div>
                <div className="text-xl sm:text-2xl font-mono-num font-bold text-gray-300">
                  @ {multiplier.toFixed(2)}x
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dual Bet Controls */}
        <div className="p-3 sm:p-4 bg-[#111728] border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Slip 1 */}
          <div className="bg-[#172138] p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 uppercase">Bet Panel 1</span>
              <div className="flex items-center gap-1">
                {[10, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    disabled={bet1Active}
                    onClick={() => setBet1Amount(amt)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  disabled={bet1Active}
                  value={bet1Amount}
                  onChange={(e) => setBet1Amount(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-[#0d1320] border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>

              {bet1Active ? (
                <button
                  disabled={gameState !== 'FLYING' || bet1CashedOut}
                  onClick={handleCashout1}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-50"
                >
                  <div className="text-[10px] uppercase leading-none font-bold">CASH OUT</div>
                  <div className="font-mono-num text-sm">
                    ₹{(bet1Amount * multiplier).toFixed(2)}
                  </div>
                </button>
              ) : bet1CashedOut ? (
                <div className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold text-center">
                  Won ₹{bet1WinAmount.toFixed(2)}!
                </div>
              ) : (
                <button
                  onClick={handlePlaceBet1}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <div className="text-[10px] uppercase leading-none">BET</div>
                  <div className="font-mono-num text-sm">₹{bet1Amount}</div>
                </button>
              )}
            </div>
          </div>

          {/* Slip 2 */}
          <div className="bg-[#172138] p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 uppercase">Bet Panel 2</span>
              <div className="flex items-center gap-1">
                {[50, 100, 250, 1000].map((amt) => (
                  <button
                    key={amt}
                    disabled={bet2Active}
                    onClick={() => setBet2Amount(amt)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  disabled={bet2Active}
                  value={bet2Amount}
                  onChange={(e) => setBet2Amount(Math.max(10, Number(e.target.value)))}
                  className="w-full bg-[#0d1320] border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>

              {bet2Active ? (
                <button
                  disabled={gameState !== 'FLYING' || bet2CashedOut}
                  onClick={handleCashout2}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-50"
                >
                  <div className="text-[10px] uppercase leading-none font-bold">CASH OUT</div>
                  <div className="font-mono-num text-sm">
                    ₹{(bet2Amount * multiplier).toFixed(2)}
                  </div>
                </button>
              ) : bet2CashedOut ? (
                <div className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold text-center">
                  Won ₹{bet2WinAmount.toFixed(2)}!
                </div>
              ) : (
                <button
                  onClick={handlePlaceBet2}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <div className="text-[10px] uppercase leading-none">BET</div>
                  <div className="font-mono-num text-sm">₹{bet2Amount}</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
