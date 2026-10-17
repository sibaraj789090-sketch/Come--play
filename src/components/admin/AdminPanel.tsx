import React, { useState } from 'react';
import { useGaming } from '../../context/GamingContext';
import {
  Shield,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Users,
  Sliders,
  Trophy,
  Settings,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  LogOut,
  AlertTriangle,
  Flame,
  Plus,
  Ban,
  RotateCcw,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react';
import { SportsMatch, User, Transaction } from '../../types/gaming';

export const AdminPanel: React.FC = () => {
  const {
    isAdmin,
    adminLogin,
    adminLogout,
    setIsAdminView,
    transactions,
    approveTransaction,
    rejectTransaction,
    allUsers,
    adminUpdateUser,
    adminAddUserBalance,
    sportsMatches,
    updateMatchOdds,
    settleMatch,
    adminSettings,
    updateAdminSettings,
    userBets,
    showToast,
  } = useGaming();

  // Admin Login State
  const [adminPin, setAdminPin] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'deposits' | 'withdrawals' | 'users' | 'games' | 'sports' | 'settings'
  >('overview');

  // Search & Filtering
  const [userSearch, setUserSearch] = useState('');
  const [balanceModalUser, setBalanceModalUser] = useState<User | null>(null);
  const [addBalanceAmount, setAddBalanceAmount] = useState<number>(500);
  const [isBonusAdd, setIsBonusAdd] = useState(false);

  // Aviator Next Crash Setter
  const [customCrashInput, setCustomCrashInput] = useState<number>(
    adminSettings.customNextMultiplier || 3.5
  );

  // Sports Match Score Editor
  const [editingMatch, setEditingMatch] = useState<SportsMatch | null>(null);
  const [scoreAInput, setScoreAInput] = useState('');
  const [scoreBInput, setScoreBInput] = useState('');

  // Handle Admin Login
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = adminLogin(adminPin);
    if (!ok) {
      setLoginError(true);
    } else {
      setLoginError(false);
      setAdminPin('');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111728] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-gaming tracking-wide text-white uppercase">
              Admin Master Login
            </h2>
            <p className="text-xs text-gray-400">
              Restricted area for platform operators, game RTP controllers & finance managers.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4">
            {loginError && (
              <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-2.5 rounded-xl text-xs font-semibold text-center">
                Invalid Admin Key. Default password is <strong className="text-white">admin123</strong>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-gray-300 uppercase block mb-1">
                Enter Master Password / PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter admin123 or 8888"
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black rounded-xl text-sm transition shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
            >
              AUTHENTICATE ADMIN
            </button>

            <button
              type="button"
              onClick={() => {
                setAdminPin('admin123');
                adminLogin('admin123');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs transition"
            >
              ⚡ Quick Fill & Login (admin123)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Key Metrics
  const totalDeposits = transactions
    .filter((t) => t.type === 'DEPOSIT' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'WITHDRAWAL' && t.status === 'APPROVED')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = transactions.filter(
    (t) => t.type === 'DEPOSIT' && t.status === 'PENDING'
  );
  const pendingWithdrawals = transactions.filter(
    (t) => t.type === 'WITHDRAWAL' && t.status === 'PENDING'
  );

  const netHouseProfit = totalDeposits - totalWithdrawals;

  const filteredUsers = allUsers.filter(
    (u) =>
      u.phone.includes(userSearch) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.referralCode.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Header Bar */}
      <div className="bg-[#101726] border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-gaming uppercase tracking-wide">
                COMEPLAY ADMIN CONTROL PANEL
              </h2>
              <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 rounded uppercase">
                SUPERADMIN
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Manage transactions, real-time game RTP, odds, user balances & PWA configurations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAdminView(false)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Switch to Player View</span>
          </button>
          <button
            onClick={adminLogout}
            className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#0d1424] p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          {
            id: 'deposits',
            label: `Deposits (${pendingDeposits.length})`,
            icon: <ArrowDownLeft className="w-4 h-4" />,
            badge: pendingDeposits.length,
          },
          {
            id: 'withdrawals',
            label: `Withdrawals (${pendingWithdrawals.length})`,
            icon: <ArrowUpRight className="w-4 h-4" />,
            badge: pendingWithdrawals.length,
          },
          { id: 'users', label: 'Users & Balances', icon: <Users className="w-4 h-4" /> },
          { id: 'games', label: 'Game RTP & Aviator Rigging', icon: <Sliders className="w-4 h-4" /> },
          { id: 'sports', label: 'Sports Odds & Settle Matches', icon: <Trophy className="w-4 h-4" /> },
          { id: 'settings', label: 'Platform Settings', icon: <Settings className="w-4 h-4" /> },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition flex-shrink-0 ${
                active
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#121929] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Platform Deposits</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-num">
                ₹{totalDeposits.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-500 block">From verified UPI transfers</span>
            </div>

            <div className="bg-[#121929] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Total Withdrawals Paid</span>
              <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono-num">
                ₹{totalWithdrawals.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-gray-500 block">Processed to players</span>
            </div>

            <div className="bg-[#121929] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Net House Profit (GGR)</span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono-num">
                ₹{netHouseProfit.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-400 block font-bold">+28.4% Margin</span>
            </div>

            <div className="bg-[#121929] border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Registered Players</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono-num">
                {allUsers.length} Users
              </div>
              <span className="text-[10px] text-gray-500 block">Total registered accounts</span>
            </div>
          </div>

          {/* Quick Action Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Deposits Box */}
            <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>Pending Deposits ({pendingDeposits.length})</span>
                </h4>
                <button
                  onClick={() => setActiveTab('deposits')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  View All
                </button>
              </div>

              {pendingDeposits.length > 0 ? (
                <div className="space-y-2">
                  {pendingDeposits.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-[#0b101c] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-200">User: {tx.userPhone}</span>
                        <div className="text-[10px] text-gray-400 font-mono-num">
                          UTR: {tx.utrNumber}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-emerald-400 text-sm">
                          ₹{tx.amount}
                        </span>
                        <button
                          onClick={() => approveTransaction(tx.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500">
                  No pending deposits at the moment.
                </div>
              )}
            </div>

            {/* Pending Withdrawals Box */}
            <div className="bg-[#121929] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  <span>Pending Withdrawals ({pendingWithdrawals.length})</span>
                </h4>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  View All
                </button>
              </div>

              {pendingWithdrawals.length > 0 ? (
                <div className="space-y-2">
                  {pendingWithdrawals.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-[#0b101c] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-200">User: {tx.userPhone}</span>
                        <div className="text-[10px] text-gray-400 font-mono-num">
                          UPI: {tx.upiId || 'Bank Transfer'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-rose-400 text-sm">
                          ₹{tx.amount}
                        </span>
                        <button
                          onClick={() => approveTransaction(tx.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          Send ₹{tx.amount}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500">
                  No pending withdrawals at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DEPOSITS TAB */}
      {activeTab === 'deposits' && (
        <div className="bg-[#111828] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
              All Deposit Requests
            </h3>
            <span className="text-xs text-gray-400">Total: {transactions.filter((t) => t.type === 'DEPOSIT').length}</span>
          </div>

          <div className="divide-y divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b101c] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User Phone</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">UTR / Ref No</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions
                  .filter((t) => t.type === 'DEPOSIT')
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-gray-200">{tx.userPhone}</td>
                      <td className="p-3 font-mono-num font-bold text-emerald-400 text-sm">
                        ₹{tx.amount}
                      </td>
                      <td className="p-3 text-gray-300">{tx.method}</td>
                      <td className="p-3 font-mono-num text-cyan-300 font-bold">{tx.utrNumber}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tx.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {tx.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveTransaction(tx.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectTransaction(tx.id, 'Invalid UTR reference')}
                              className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg font-bold text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. WITHDRAWALS TAB */}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#111828] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
              All Withdrawal Requests
            </h3>
            <span className="text-xs text-gray-400">Total: {transactions.filter((t) => t.type === 'WITHDRAWAL').length}</span>
          </div>

          <div className="divide-y divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b101c] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User Phone</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">UPI ID / Bank Account</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions
                  .filter((t) => t.type === 'WITHDRAWAL')
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-gray-200">{tx.userPhone}</td>
                      <td className="p-3 font-mono-num font-bold text-rose-400 text-sm">
                        ₹{tx.amount}
                      </td>
                      <td className="p-3 text-cyan-300 font-mono-num font-semibold">
                        {tx.upiId || `${tx.bankDetails?.accountNumber} (${tx.bankDetails?.ifsc})`}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tx.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {tx.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveTransaction(tx.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                            >
                              Approve & Pay
                            </button>
                            <button
                              onClick={() => rejectTransaction(tx.id, 'Account details mismatch')}
                              className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg font-bold text-xs"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-[#111828] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Players & Balance Manager
            </h3>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, name, referral..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b101c] text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Real Balance</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">VIP</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-gray-200">
                      <div>{user.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono-num">{user.referralCode}</div>
                    </td>
                    <td className="p-3 font-mono-num text-gray-300">{user.phone}</td>
                    <td className="p-3 font-mono-num font-bold text-emerald-400">
                      ₹{user.balance.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono-num font-bold text-amber-400">
                      ₹{user.bonusBalance.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        VIP {user.vipLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          user.isBanned
                            ? 'bg-rose-600/30 text-rose-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setBalanceModalUser(user);
                            setIsBonusAdd(false);
                            setAddBalanceAmount(500);
                          }}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs"
                        >
                          + Cash
                        </button>
                        <button
                          onClick={() => {
                            adminUpdateUser(user.id, { isBanned: !user.isBanned });
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                            user.isBanned
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white'
                          }`}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Balance Modal */}
          {balanceModalUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#162035] border border-cyan-500/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Credit Balance to {balanceModalUser.name}
                  </h4>
                  <button onClick={() => setBalanceModalUser(null)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="flex gap-2 text-xs font-bold">
                  <button
                    onClick={() => setIsBonusAdd(false)}
                    className={`flex-1 py-1.5 rounded-lg border ${
                      !isBonusAdd
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 border-slate-700 text-gray-400'
                    }`}
                  >
                    Real Cash
                  </button>
                  <button
                    onClick={() => setIsBonusAdd(true)}
                    className={`flex-1 py-1.5 rounded-lg border ${
                      isBonusAdd
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-700 text-gray-400'
                    }`}
                  >
                    Bonus Balance
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
                    Amount to Add (₹)
                  </label>
                  <input
                    type="number"
                    value={addBalanceAmount}
                    onChange={(e) => setAddBalanceAmount(Number(e.target.value))}
                    className="w-full bg-[#0d1424] border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold font-mono-num text-white"
                  />
                  <div className="flex gap-1.5 mt-2">
                    {[100, 500, 1000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAddBalanceAmount(amt)}
                        className="flex-1 py-1 rounded text-xs font-bold bg-slate-800 text-gray-300 hover:bg-slate-700"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      adminAddUserBalance(balanceModalUser.id, addBalanceAmount, isBonusAdd);
                      setBalanceModalUser(null);
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Confirm Credit
                  </button>
                  <button
                    onClick={() => {
                      adminAddUserBalance(balanceModalUser.id, -addBalanceAmount, isBonusAdd);
                      setBalanceModalUser(null);
                    }}
                    className="py-2.5 px-4 bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white font-bold rounded-xl text-xs"
                  >
                    Deduct
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. GAME RTP & AVIATOR RIGGING TAB */}
      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {/* Aviator Rigging Panel */}
          <div className="bg-[#121929] border border-red-900/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈️</span>
              <h3 className="font-gaming font-black text-lg text-white">
                AVIATOR CRASH CONTROL & RTP
              </h3>
            </div>

            <p className="text-xs text-gray-300">
              Control the RNG algorithm and flight crash multiplier for the upcoming rounds.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Algorithm Mode
              </label>
              {[
                {
                  id: 'fair',
                  name: 'Standard Fair RTP (97%)',
                  desc: 'Random mathematical curve based on cryptographic seed',
                },
                {
                  id: 'house_favour',
                  name: 'House Edge Favour (Low Crash < 1.40x)',
                  desc: 'Higher frequency of early crashes to ensure operator margin',
                },
                {
                  id: 'high_multiplier',
                  name: 'Player Fest (Boosted Flights 5x - 20x)',
                  desc: 'Generates exciting high multipliers for promotional tournaments',
                },
                {
                  id: 'custom_next',
                  name: 'Force Exact Next Crash Multiplier',
                  desc: 'Operator sets the exact crash point for the very next round',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() =>
                    updateAdminSettings({
                      aviatorRigging: opt.id as typeof adminSettings.aviatorRigging,
                    })
                  }
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    adminSettings.aviatorRigging === opt.id
                      ? 'bg-red-950/40 border-red-500 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>{opt.name}</span>
                    {adminSettings.aviatorRigging === opt.id && (
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>

            {/* Custom Next Multiplier Setter */}
            {adminSettings.aviatorRigging === 'custom_next' && (
              <div className="bg-[#0b101c] p-3 rounded-xl border border-red-800/60 space-y-2 animate-in fade-in">
                <label className="text-[11px] font-bold text-amber-400 uppercase block">
                  Set Exact Next Crash Multiplier (e.g. 10.50x)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1.01"
                    max="1000"
                    value={customCrashInput}
                    onChange={(e) => setCustomCrashInput(Number(e.target.value))}
                    className="flex-1 bg-[#151c2e] border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold font-mono-num text-white"
                  />
                  <button
                    onClick={() => {
                      updateAdminSettings({ customNextMultiplier: customCrashInput });
                      showToast(`Next Aviator round will crash exactly at ${customCrashInput}x!`);
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs"
                  >
                    Apply Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mines & Casino Win Rate */}
          <div className="bg-[#121929] border border-cyan-900/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">💣</span>
              <h3 className="font-gaming font-black text-lg text-white">
                MINES & ORIGINALS WIN RATE
              </h3>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-300">Target Win Rate:</span>
                <span className="text-cyan-400 font-mono-num">{adminSettings.minesWinRate}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={adminSettings.minesWinRate}
                onChange={(e) => updateAdminSettings({ minesWinRate: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Adjusts the RNG bomb density distribution. Default: 85%
              </span>
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="bg-[#0b101c] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Platform Maintenance Mode</span>
                <span className="text-[10px] text-gray-400">Temporarily pause real-money wagering</span>
              </div>
              <button
                onClick={() =>
                  updateAdminSettings({ maintenanceMode: !adminSettings.maintenanceMode })
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  adminSettings.maintenanceMode
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                {adminSettings.maintenanceMode ? 'ENABLED (LOCKED)' : 'DISABLED (LIVE)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SPORTS ODDS & MATCH SETTLER TAB */}
      {activeTab === 'sports' && (
        <div className="bg-[#111828] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Manage Live Matches & Auto-Settle Bets
            </h3>
          </div>

          <div className="space-y-3">
            {sportsMatches.map((match) => (
              <div
                key={match.id}
                className="bg-[#0b101d] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-[11px] font-semibold text-cyan-400">
                    {match.format} · {match.tournament}
                  </div>
                  <div className="font-bold text-sm text-white mt-0.5">
                    {match.flagA} {match.teamA} ({match.backOddsA}x) vs {match.flagB} {match.teamB} (
                    {match.backOddsB}x)
                  </div>
                  <div className="text-xs text-amber-400 font-mono-num font-bold mt-1">
                    {match.scoreA ? `Score: ${match.scoreA}` : `Start: ${match.startTime}`}
                  </div>
                </div>

                {/* Settle or Adjust */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      updateMatchOdds(match.id, { isSuspended: !match.isSuspended })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      match.isSuspended
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-gray-300 hover:text-white'
                    }`}
                  >
                    {match.isSuspended ? 'Suspended (Unlock)' : 'Suspend Market'}
                  </button>

                  <button
                    onClick={() => {
                      settleMatch(match.id, 'teamA');
                      showToast(`${match.teamA} declared winner! Winning bets credited.`);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Settle: {match.teamAShort} Wins
                  </button>

                  <button
                    onClick={() => {
                      settleMatch(match.id, 'teamB');
                      showToast(`${match.teamB} declared winner! Winning bets credited.`);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  >
                    Settle: {match.teamBShort} Wins
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-[#111828] border border-slate-800 rounded-2xl p-4 sm:p-5 max-w-xl space-y-4 animate-in fade-in">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Platform & Payment Gateway Configuration
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-300 uppercase block mb-1">
                Admin Receiving UPI ID
              </label>
              <input
                type="text"
                value={adminSettings.upiPaymentId}
                onChange={(e) => updateAdminSettings({ upiPaymentId: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-sm font-mono-num font-bold text-amber-300"
              />
            </div>

            <div>
              <label className="font-bold text-gray-300 uppercase block mb-1">
                UPI Payee Brand Name
              </label>
              <input
                type="text"
                value={adminSettings.upiPayeeName}
                onChange={(e) => updateAdminSettings({ upiPayeeName: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">
                  Referral Bonus (₹)
                </label>
                <input
                  type="number"
                  value={adminSettings.referralBonus}
                  onChange={(e) => updateAdminSettings({ referralBonus: Number(e.target.value) })}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-sm font-mono-num font-bold text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 uppercase block mb-1">
                  Min Withdrawal (₹)
                </label>
                <input
                  type="number"
                  value={adminSettings.minWithdrawal}
                  onChange={(e) => updateAdminSettings({ minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-sm font-mono-num font-bold text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 uppercase block mb-1">
                Top Announcement Marquee
              </label>
              <textarea
                rows={2}
                value={adminSettings.siteAnnouncement}
                onChange={(e) => updateAdminSettings({ siteAnnouncement: e.target.value })}
                className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-4 py-2 text-xs text-gray-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
