import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import { X, ArrowDownCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { isWithdrawOpen, closeWithdraw, currentUser, submitWithdrawal, adminSettings, showToast } = useGaming();

  const [amount, setAmount] = useState<number>(500);
  const [withdrawType, setWithdrawType] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState(currentUser?.savedUpi || (currentUser?.phone ? `${currentUser.phone}@paytm` : ''));
  const [bankAcc, setBankAcc] = useState(currentUser?.savedBank?.accountNumber || '');
  const [ifsc, setIfsc] = useState(currentUser?.savedBank?.ifsc || '');
  const [holderName, setHolderName] = useState(currentUser?.savedBank?.holderName || currentUser?.name || '');
  const [success, setSuccess] = useState(false);

  if (!isWithdrawOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (amount < adminSettings.minWithdrawal) {
      showToast(`Minimum withdrawal amount is ₹${adminSettings.minWithdrawal}`);
      return;
    }

    if (amount > currentUser.balance) {
      showToast('Withdrawal amount exceeds your current cash balance');
      return;
    }

    let ok = false;
    if (withdrawType === 'UPI') {
      if (!upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. yourname@okaxis)');
        return;
      }
      ok = submitWithdrawal(amount, upiId);
    } else {
      if (!bankAcc || !ifsc || !holderName) {
        showToast('Please enter complete bank account details.');
        return;
      }
      ok = submitWithdrawal(amount, bankAcc, {
        accountNumber: bankAcc,
        ifsc,
        holderName,
      });
    }

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeWithdraw();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#111828] border border-cyan-900/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#172238] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-gaming font-black text-lg text-white">
              WITHDRAW CASH (UPI/BANK)
            </span>
          </div>
          <button onClick={closeWithdraw} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero OTP Badge */}
        <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-300 font-bold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Disbursement • No OTP Verification Required</span>
          </span>
          <span className="bg-emerald-500/20 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/40">
            24/7 LIVE
          </span>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">Withdrawal Initiated!</h3>
            <p className="text-xs text-gray-300">
              ₹{amount} has been queued for UPI disbursement. Admin will release funds within 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="p-4 sm:p-5 space-y-4">
            {/* Balance Card */}
            <div className="bg-[#0b101c] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Withdrawable Balance</span>
                <div className="text-lg font-black text-emerald-400 font-mono-num">
                  ₹{currentUser ? currentUser.balance.toFixed(2) : '0.00'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => currentUser && setAmount(Math.floor(currentUser.balance))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 rounded-lg border border-slate-700"
              >
                Withdraw All
              </button>
            </div>

            {/* Type selector */}
            <div className="flex border-b border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setWithdrawType('UPI')}
                className={`flex-1 py-2.5 text-center transition border-b-2 ${
                  withdrawType === 'UPI'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                UPI Transfer (Fastest)
              </button>
              <button
                type="button"
                onClick={() => setWithdrawType('BANK')}
                className={`flex-1 py-2.5 text-center transition border-b-2 ${
                  withdrawType === 'BANK'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Direct Bank IMPS
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                Withdrawal Amount (Min ₹{adminSettings.minWithdrawal})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min={adminSettings.minWithdrawal}
                  max={currentUser ? currentUser.balance : 100000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {withdrawType === 'UPI' ? (
              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                  Recipient UPI ID / VPA
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mobile@paytm or name@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-0.5">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name as per Bank Passbook"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-0.5">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bank Account Number"
                    value={bankAcc}
                    onChange={(e) => setBankAcc(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono-num text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-0.5">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono-num text-white uppercase"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
            >
              REQUEST WITHDRAWAL (₹{amount})
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
