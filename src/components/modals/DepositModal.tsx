import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, Check, Copy, QrCode, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Transaction } from '../../types/gaming';

export const DepositModal: React.FC = () => {
  const { isDepositOpen, closeDeposit, submitDeposit, adminSettings, showToast } = useGaming();

  const [amount, setAmount] = useState<number>(500);
  const [selectedMethod, setSelectedMethod] = useState<Transaction['method']>('UPI_PHONEPE');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isDepositOpen) return null;

  const quickAmounts = [
    { amt: 100, bonus: '+0%' },
    { amt: 300, bonus: '+50%' },
    { amt: 500, bonus: '+100%' },
    { amt: 1000, bonus: '+120%' },
    { amt: 2500, bonus: '+150%' },
    { amt: 5000, bonus: '+200%' },
  ];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(adminSettings.upiPaymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 8) {
      showToast('Please enter a valid 12-digit UPI Reference / UTR Number.');
      return;
    }

    submitDeposit(amount, selectedMethod, utrNumber);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      closeDeposit();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#111828] border border-cyan-900/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="bg-[#172238] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <span className="font-gaming font-black text-lg text-white">
              INSTANT UPI DEPOSIT
            </span>
          </div>
          <button onClick={closeDeposit} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">Deposit Request Submitted!</h3>
            <p className="text-xs text-gray-300">
              UTR <span className="font-mono-num text-cyan-400 font-bold">{utrNumber}</span> has been sent for admin verification. Balance will be credited automatically within 2 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar">
            {/* Amount Selection */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-2">
                Select Deposit Amount
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {quickAmounts.map(({ amt, bonus }) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`p-2.5 rounded-xl border text-center transition relative ${
                      amount === amt
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-gray-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-mono-num font-bold">₹{amt}</span>
                    <span className="block text-[9px] text-amber-400 font-bold mt-0.5">
                      {bonus} Bonus
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Custom amount (Min ₹100)"
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* UPI Payment App Selection */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-2">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI_PHONEPE', label: 'PhonePe', icon: '🟣' },
                  { id: 'UPI_GPAY', label: 'Google Pay', icon: '🔵' },
                  { id: 'UPI_PAYTM', label: 'Paytm UPI', icon: '🟦' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as Transaction['method'])}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      selectedMethod === m.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI ID & QR Box */}
            <div className="bg-[#0b101c] p-3 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Official UPI ID:</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy UPI'}</span>
                </button>
              </div>

              <div className="bg-[#141b2c] p-2 rounded-lg font-mono-num text-xs font-bold text-amber-300 text-center select-all border border-slate-700/60">
                {adminSettings.upiPaymentId}
              </div>

              <div className="text-[11px] text-gray-400 text-center">
                Payee: <strong className="text-white">{adminSettings.upiPayeeName}</strong>
              </div>
            </div>

            {/* 12-Digit UTR Input */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Enter 12-Digit UPI Ref / UTR No.
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                placeholder="e.g. 428819283741"
                className="w-full bg-[#0a0f1d] border border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm font-mono-num font-bold text-white focus:outline-none focus:border-cyan-400 placeholder-gray-500"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Found on your payment app receipt under 'UPI Transaction ID' or 'UTR'.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
            >
              SUBMIT DEPOSIT (₹{amount})
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
