import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  X,
  Wallet,
  ArrowDownCircle,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
  Zap,
  TrendingUp,
  History,
  QrCode,
} from 'lucide-react';
import { Transaction } from '../../types/gaming';

export const UserWalletModal: React.FC = () => {
  const {
    isWalletOpen,
    closeWallet,
    currentUser,
    openDeposit,
    openWithdraw,
    submitWithdrawal,
    updateSavedPaymentDetails,
    transactions,
    adminSettings,
    showToast,
  } = useGaming();

  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'history'>('overview');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

  // Quick withdrawal form state
  const [withdrawAmt, setWithdrawAmt] = useState<number>(500);
  const [withdrawType, setWithdrawType] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState(currentUser?.savedUpi || '9876543210@paytm');
  const [bankAcc, setBankAcc] = useState(currentUser?.savedBank?.accountNumber || '');
  const [ifsc, setIfsc] = useState(currentUser?.savedBank?.ifsc || '');
  const [holderName, setHolderName] = useState(currentUser?.savedBank?.holderName || currentUser?.name || '');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isWalletOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-sm bg-[#121929] border border-cyan-800/60 rounded-2xl p-6 text-center space-y-4">
          <Wallet className="w-12 h-12 text-cyan-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Please Login to Access Wallet</h3>
          <p className="text-xs text-gray-400">
            Sign in with your mobile number or Gmail (no OTP verification needed) to manage your funds and withdrawals.
          </p>
          <button
            onClick={closeWallet}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter user's transactions
  const userTransactions = transactions.filter(
    (tx) => tx.userId === currentUser.id || (currentUser.phone && tx.userPhone === currentUser.phone)
  );

  const filteredHistory = userTransactions.filter((tx) => {
    if (historyFilter === 'ALL') return true;
    return tx.type === historyFilter;
  });

  const handleQuickWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    if (withdrawAmt < adminSettings.minWithdrawal) {
      showToast(`Minimum withdrawal is ₹${adminSettings.minWithdrawal}`);
      return;
    }

    if (withdrawAmt > currentUser.balance) {
      showToast('Withdrawal amount exceeds your withdrawable balance');
      return;
    }

    if (withdrawType === 'UPI') {
      if (!upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. mobile@paytm or name@okaxis)');
        return;
      }
      submitWithdrawal(withdrawAmt, upiId);
    } else {
      if (!bankAcc || !ifsc || !holderName) {
        showToast('Please fill all bank details');
        return;
      }
      submitWithdrawal(withdrawAmt, bankAcc, {
        accountNumber: bankAcc,
        ifsc,
        holderName,
      });
    }

    setActiveTab('history');
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-2xl bg-[#101726] border border-cyan-800/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#172238] px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-gaming font-black text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
                <span>USER WALLET & WITHDRAWAL</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-sans font-bold">
                  Instant UPI
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                {currentUser.phone ? `📱 +91 ${currentUser.phone}` : `✉️ ${currentUser.email}`} • VIP {currentUser.vipLevel}
              </p>
            </div>
          </div>
          <button
            onClick={closeWallet}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="bg-gradient-to-br from-[#0c1424] via-[#121c32] to-[#0c1424] p-4 sm:p-5 border-b border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Main Cash Balance */}
            <div className="bg-[#152037]/80 rounded-xl p-3.5 border border-cyan-500/30 relative overflow-hidden">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Withdrawable Cash</span>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Ready to Cashout
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono-num mt-1 flex items-baseline gap-1">
                <span className="text-cyan-400 text-lg">₹</span>
                <span>{currentUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Instant withdrawal to any UPI / Bank</div>
            </div>

            {/* Bonus Balance */}
            <div className="bg-[#152037]/80 rounded-xl p-3.5 border border-amber-500/30">
              <div className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center justify-between">
                <span>Bonus Balance</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Bet Usable
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono-num mt-1 flex items-baseline gap-1">
                <span className="text-amber-400 text-lg">₹</span>
                <span>{currentUser.bonusBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">Auto-applied for casino & sports bets</div>
            </div>

            {/* Total Deposited & Withdrawn */}
            <div className="bg-[#152037]/80 rounded-xl p-3.5 border border-slate-700/60 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Deposited:</span>
                <span className="font-bold text-white font-mono-num">₹{currentUser.totalDeposited.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-400">Total Withdrawn:</span>
                <span className="font-bold text-emerald-400 font-mono-num">₹{currentUser.totalWithdrawn.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-slate-700">
                <span className="text-gray-400">VIP Tier:</span>
                <span className="font-bold text-cyan-400">Level {currentUser.vipLevel} Star</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => {
                closeWallet();
                openDeposit();
              }}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ADD MONEY / DEPOSIT</span>
            </button>

            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 border active:scale-95 ${
                activeTab === 'withdraw'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-cyan-500/40'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>INSTANT WITHDRAWAL</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Wallet */}
        <div className="flex border-b border-slate-800 bg-[#0e1524] text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Withdraw Cash</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Logs ({userTransactions.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 no-scrollbar space-y-4">
          {/* TAB 1: OVERVIEW & PROFILE */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* No OTP verification highlight card */}
              <div className="bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Zap className="w-5 h-5 fill-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Express Withdrawal Guarantee</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
                        NO OTP
                      </span>
                    </h4>
                    <p className="text-xs text-gray-300">
                      Disbursement directly to your UPI ID without SMS verification delays.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Cashout
                </button>
              </div>

              {/* User Account Info Box */}
              <div className="bg-[#0b101c] p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Account Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#131b2e] p-3 rounded-lg border border-slate-700/60">
                    <span className="text-gray-400 block text-[10px]">Registered Contact:</span>
                    <span className="font-bold text-white text-sm">
                      {currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.email}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">✓ Verified Player</span>
                  </div>

                  <div className="bg-[#131b2e] p-3 rounded-lg border border-slate-700/60">
                    <span className="text-gray-400 block text-[10px]">Referral Code:</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono-num font-black text-amber-400 text-sm">
                        {currentUser.referralCode}
                      </span>
                      <button
                        onClick={handleCopyReferral}
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Earn ₹110 per referral</span>
                  </div>
                </div>
              </div>

              {/* Saved Payment Methods Box */}
              <div className="bg-[#0b101c] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Linked Cashout Details (UPI & Bank)
                  </h4>
                  <span className="text-[10px] text-cyan-400">Auto-saved for 1-tap withdrawal</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#131b2e] p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="text-[10px] text-gray-400 block">Default UPI ID:</span>
                        <span className="font-bold text-white font-mono-num">
                          {currentUser.savedUpi || 'Not set (will be saved upon first withdrawal)'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="text-xs text-cyan-400 hover:underline font-bold"
                    >
                      Use to Withdraw
                    </button>
                  </div>

                  {currentUser.savedBank && (
                    <div className="bg-[#131b2e] p-3 rounded-lg border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Building className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-[10px] text-gray-400 block">Saved Bank Account:</span>
                          <span className="font-bold text-white font-mono-num">
                            A/C: ••••{currentUser.savedBank.accountNumber.slice(-4)} ({currentUser.savedBank.ifsc})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAW CASH */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleQuickWithdraw} className="space-y-4">
              {/* Fast notice */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-cyan-950/40 border border-cyan-800/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-cyan-200">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>
                  Withdrawals processed 24/7 via automated UPI IMPS gateway. Zero OTP prompt. Min amount: ₹{adminSettings.minWithdrawal}.
                </span>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Select or Enter Amount (Available: ₹{currentUser.balance.toFixed(2)})
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[300, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmt(amt)}
                      className={`py-2 px-1 rounded-lg text-xs font-mono-num font-bold border transition ${
                        withdrawAmt === amt
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 border-slate-800 text-gray-300 hover:bg-slate-800'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={adminSettings.minWithdrawal}
                    max={currentUser.balance}
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(Number(e.target.value))}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-8 pr-24 py-2.5 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmt(Math.floor(currentUser.balance))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-cyan-400 rounded-lg border border-slate-700"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setWithdrawType('UPI')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    withdrawType === 'UPI'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI (PhonePe/GPay/Paytm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawType('BANK')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    withdrawType === 'BANK'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Bank IMPS Direct</span>
                </button>
              </div>

              {withdrawType === 'UPI' ? (
                <div>
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Your UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourphone@paytm or name@okaxis"
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Supported: PhonePe, Google Pay, Paytm, BHIM, Cred, Amazon Pay
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      placeholder="Name on bank passbook"
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={bankAcc}
                      onChange={(e) => setBankAcc(e.target.value)}
                      placeholder="Enter account number"
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-num text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      required
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-num text-white uppercase"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={currentUser.balance < adminSettings.minWithdrawal}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center gap-2"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>CONFIRM & WITHDRAW ₹{withdrawAmt} (NO OTP)</span>
              </button>
            </form>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {/* Filter pills */}
              <div className="flex items-center gap-2">
                {(['ALL', 'DEPOSIT', 'WITHDRAWAL'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                      historyFilter === filter
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Transactions' : filter === 'DEPOSIT' ? 'Deposits' : 'Withdrawals'}
                  </button>
                ))}
              </div>

              {filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs bg-[#0b101c] rounded-xl border border-slate-800">
                  No transactions found in this category.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((tx) => {
                    const isDep = tx.type === 'DEPOSIT';
                    const isApproved = tx.status === 'APPROVED';
                    const isPending = tx.status === 'PENDING';

                    return (
                      <div
                        key={tx.id}
                        className="bg-[#0b101c] p-3 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isDep
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            }`}
                          >
                            {isDep ? '↓' : '↑'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">
                                {isDep ? 'Deposit' : 'Withdrawal'}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  isApproved
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : isPending
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono-num mt-0.5">
                              {tx.createdAt} • {tx.method.replace('_', ' ')}
                              {tx.upiId && ` (${tx.upiId})`}
                              {tx.utrNumber && ` (UTR: ${tx.utrNumber})`}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-black font-mono-num text-sm ${
                              isDep ? 'text-emerald-400' : 'text-cyan-400'
                            }`}
                          >
                            {isDep ? '+' : '-'}₹{tx.amount.toFixed(2)}
                          </div>
                          {isPending && (
                            <span className="text-[10px] text-amber-400 font-medium">Processing...</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
