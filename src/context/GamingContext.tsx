import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Bet,
  Transaction,
  SportsMatch,
  AdminSettings,
  LiveBetFeedItem,
  PredictionItem,
} from '../types/gaming';
import {
  INITIAL_GAMES,
  INITIAL_LIVE_BETS,
  INITIAL_PREDICTIONS,
  INITIAL_SPORTS_MATCHES,
} from '../data/mockData';

interface SportsSlipData {
  match: SportsMatch;
  selection: string;
  odds: number;
  type: 'back' | 'lay';
}

interface GamingContextType {
  // User state
  currentUser: User | null;
  isAdmin: boolean;
  login: (phone: string, pin: string) => boolean;
  register: (phone: string, pin: string, referralCode?: string) => boolean;
  logout: () => void;
  adminLogin: (pass: string) => boolean;
  adminLogout: () => void;

  // Wallet & Bets
  userBets: Bet[];
  placeBet: (bet: Omit<Bet, 'id' | 'userId' | 'userName' | 'createdAt'>) => string | null;
  settleBet: (betId: string, won: boolean, multiplier?: number) => void;
  updateUserBalance: (delta: number) => void;

  // Transactions (Deposit / Withdraw)
  transactions: Transaction[];
  submitDeposit: (amount: number, method: Transaction['method'], utr: string) => void;
  submitWithdrawal: (amount: number, upiId: string, bankDetails?: Transaction['bankDetails']) => boolean;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string, note?: string) => void;

  // Live feed
  liveBets: LiveBetFeedItem[];

  // Matches & Odds
  sportsMatches: SportsMatch[];
  predictions: PredictionItem[];
  placePredictionBet: (predictionId: string, choice: 'yes' | 'no', amount: number) => boolean;
  updateMatchOdds: (matchId: string, updates: Partial<SportsMatch>) => void;
  settleMatch: (matchId: string, winner: 'teamA' | 'teamB' | 'cancelled') => void;

  // Admin Management
  adminSettings: AdminSettings;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  allUsers: User[];
  adminUpdateUser: (userId: string, updates: Partial<User>) => void;
  adminAddUserBalance: (userId: string, amount: number, isBonus?: boolean) => void;

  // Active UI Modals
  activeGame: string | null;
  openGame: (gameId: string) => void;
  closeGame: () => void;

  activeAuthModal: 'login' | 'register' | null;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  isDepositOpen: boolean;
  openDeposit: () => void;
  closeDeposit: () => void;

  isWithdrawOpen: boolean;
  openWithdraw: () => void;
  closeWithdraw: () => void;

  isReferralOpen: boolean;
  openReferral: () => void;
  closeReferral: () => void;

  sportsSlip: SportsSlipData | null;
  openSportsSlip: (data: SportsSlipData) => void;
  closeSportsSlip: () => void;

  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const DEFAULT_USER: User = {
  id: 'usr_demo_1',
  phone: '9876543210',
  name: 'Player 9876',
  balance: 1540.0,
  bonusBalance: 200.0,
  role: 'user',
  isBanned: false,
  vipLevel: 3,
  referralCode: 'COME888',
  referredBy: undefined,
  totalDeposited: 3000,
  totalWithdrawn: 1400,
  createdAt: '2026-01-15',
};

const DEFAULT_USERS: User[] = [
  DEFAULT_USER,
  {
    id: 'usr_2',
    phone: '9845112233',
    name: 'Rohit K.',
    balance: 5420.5,
    bonusBalance: 110,
    role: 'user',
    isBanned: false,
    vipLevel: 4,
    referralCode: 'ROHIT77',
    totalDeposited: 8000,
    totalWithdrawn: 2500,
    createdAt: '2026-02-10',
  },
  {
    id: 'usr_3',
    phone: '9123456789',
    name: 'Amit Verma',
    balance: 310.0,
    bonusBalance: 0,
    role: 'user',
    isBanned: false,
    vipLevel: 1,
    referralCode: 'AMIT99',
    totalDeposited: 500,
    totalWithdrawn: 0,
    createdAt: '2026-03-01',
  },
  {
    id: 'usr_4',
    phone: '9988776655',
    name: 'Suspicious Bot',
    balance: 0.0,
    bonusBalance: 0,
    role: 'user',
    isBanned: true,
    vipLevel: 1,
    referralCode: 'BOT00',
    totalDeposited: 100,
    totalWithdrawn: 0,
    createdAt: '2026-03-12',
  },
];

const DEFAULT_SETTINGS: AdminSettings = {
  aviatorRigging: 'fair',
  customNextMultiplier: 3.5,
  minesWinRate: 85,
  referralBonus: 110,
  upiPaymentId: 'comeplay.gaming@okaxis',
  upiPayeeName: 'COMEPLAY ENTERTAINMENT',
  minDeposit: 100,
  minWithdrawal: 300,
  siteAnnouncement: '⚡ IPL Special: 100% Deposit Match Bonus on UPI transfers today! Fast 5-minute withdrawals.',
  maintenanceMode: false,
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'usr_2',
    userPhone: '9845112233',
    type: 'DEPOSIT',
    amount: 1000,
    method: 'UPI_PHONEPE',
    utrNumber: '428819283741',
    status: 'APPROVED',
    createdAt: '10 mins ago',
    processedAt: '8 mins ago',
  },
  {
    id: 'tx-102',
    userId: 'usr_3',
    userPhone: '9123456789',
    type: 'DEPOSIT',
    amount: 500,
    method: 'UPI_GPAY',
    utrNumber: '998234812390',
    status: 'PENDING',
    createdAt: '3 mins ago',
  },
  {
    id: 'tx-103',
    userId: 'usr_demo_1',
    userPhone: '9876543210',
    type: 'WITHDRAWAL',
    amount: 500,
    method: 'UPI_PAYTM',
    upiId: '9876543210@paytm',
    status: 'PENDING',
    createdAt: '5 mins ago',
  },
];

const GamingContext = createContext<GamingContextType | undefined>(undefined);

export const GamingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cp_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('cp_is_admin') === 'true';
  });

  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cp_all_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('cp_admin_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cp_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [sportsMatches, setSportsMatches] = useState<SportsMatch[]>(() => {
    const saved = localStorage.getItem('cp_matches');
    return saved ? JSON.parse(saved) : INITIAL_SPORTS_MATCHES;
  });

  const [predictions, setPredictions] = useState<PredictionItem[]>(() => {
    const saved = localStorage.getItem('cp_predictions');
    return saved ? JSON.parse(saved) : INITIAL_PREDICTIONS;
  });

  const [userBets, setUserBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('cp_user_bets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'bet-init-1',
        userId: 'usr_demo_1',
        userName: 'Player 9876',
        gameId: 'aviator',
        gameName: 'Aviator',
        amount: 50,
        multiplier: 2.45,
        payout: 122.5,
        status: 'WON',
        betType: 'casino',
        createdAt: '12m ago',
      },
      {
        id: 'bet-init-2',
        userId: 'usr_demo_1',
        userName: 'Player 9876',
        gameId: 'match-1',
        gameName: 'India vs West Indies',
        amount: 100,
        multiplier: 1.28,
        payout: 128,
        status: 'PENDING',
        betType: 'sports',
        details: 'Match Winner: India (Back @ 1.28)',
        createdAt: '20m ago',
      },
    ];
  });

  const [liveBets, setLiveBets] = useState<LiveBetFeedItem[]>(INITIAL_LIVE_BETS);

  // Modals state
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeAuthModal, setActiveAuthModal] = useState<'login' | 'register' | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [sportsSlip, setSportsSlip] = useState<SportsSlipData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cp_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cp_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('cp_admin_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem('cp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cp_matches', JSON.stringify(sportsMatches));
  }, [sportsMatches]);

  useEffect(() => {
    localStorage.setItem('cp_user_bets', JSON.stringify(userBets));
  }, [userBets]);

  // Live bets ticker generator (every 4 seconds)
  useEffect(() => {
    const gameNames = ['Aviator', 'Chicken road2', 'Fortune Gems 500', 'Mines', '7 Up 7 Down', 'Limbo', 'Ludo', 'Fortune Garuda 1000'];
    const playerPrefixes = ['User389', 'User420', 'User911', 'User572', 'User618', 'Incognito', 'User773', 'User104'];
    const icons = ['✈️', '🐔', '💎', '💣', '🎲', '📈', '🎯', '🦅'];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * gameNames.length);
      const game = gameNames[idx];
      const icon = icons[idx];
      const player = playerPrefixes[Math.floor(Math.random() * playerPrefixes.length)] + (Math.random() > 0.4 ? '...' : '');
      const payout = parseFloat((Math.random() * 450 + 20).toFixed(2));

      setLiveBets((prev) => [
        {
          id: `lb-${Date.now()}-${Math.random()}`,
          game,
          player,
          payout,
          currency: '₹',
          timeAgo: 'just now',
          icon,
        },
        ...prev.slice(0, 19),
      ]);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  // Auth methods
  const login = (phone: string, pin: string) => {
    const found = allUsers.find((u) => u.phone === phone);
    if (found) {
      if (found.isBanned) {
        showToast('This account is suspended. Contact support.');
        return false;
      }
      setCurrentUser(found);
      setActiveAuthModal(null);
      return true;
    }
    // Auto register for seamless quick demo
    const newUser: User = {
      id: `usr_${Date.now()}`,
      phone,
      name: `User ${phone.slice(-4)}`,
      balance: 100, // Welcome gift
      bonusBalance: 110,
      role: 'user',
      isBanned: false,
      vipLevel: 1,
      referralCode: `CP${phone.slice(-4)}`,
      totalDeposited: 0,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveAuthModal(null);
    return true;
  };

  const register = (phone: string, pin: string, referralCode?: string) => {
    const existing = allUsers.find((u) => u.phone === phone);
    if (existing) {
      setCurrentUser(existing);
      setActiveAuthModal(null);
      return true;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      phone,
      name: `Player ${phone.slice(-4)}`,
      balance: 100, // ₹100 welcome credit
      bonusBalance: referralCode ? adminSettings.referralBonus : 50,
      role: 'user',
      isBanned: false,
      vipLevel: 1,
      referralCode: `COME${phone.slice(-4)}`,
      referredBy: referralCode,
      totalDeposited: 0,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setActiveAuthModal(null);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const adminLogin = (pass: string) => {
    // PIN or default password
    if (pass === 'admin123' || pass === 'admin' || pass === '8888') {
      setIsAdmin(true);
      localStorage.setItem('cp_is_admin', 'true');
      setIsAdminView(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('cp_is_admin');
    setIsAdminView(false);
  };

  // Wallet updates
  const updateUserBalance = (delta: number) => {
    if (!currentUser) return;
    const newBal = Math.max(0, parseFloat((currentUser.balance + delta).toFixed(2)));
    const updated = { ...currentUser, balance: newBal };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Bet placement
  const placeBet = (betData: Omit<Bet, 'id' | 'userId' | 'userName' | 'createdAt'>): string | null => {
    if (!currentUser) {
      setActiveAuthModal('login');
      return null;
    }
    if (currentUser.balance < betData.amount) {
      setIsDepositOpen(true);
      return null;
    }

    // Deduct amount
    updateUserBalance(-betData.amount);

    const newBet: Bet = {
      ...betData,
      id: `bet_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: 'Just now',
    };

    setUserBets((prev) => [newBet, ...prev]);

    // Also push to live bets ticker
    setLiveBets((prev) => [
      {
        id: `lb-${Date.now()}`,
        game: betData.gameName,
        player: currentUser.name,
        payout: betData.payout > 0 ? betData.payout : betData.amount,
        currency: '₹',
        timeAgo: 'just now',
      },
      ...prev.slice(0, 19),
    ]);

    return newBet.id;
  };

  const settleBet = (betId: string, won: boolean, multiplier?: number) => {
    setUserBets((prev) =>
      prev.map((bet) => {
        if (bet.id !== betId) return bet;
        const mult = multiplier || bet.multiplier;
        const payout = won ? parseFloat((bet.amount * mult).toFixed(2)) : 0;
        if (won && payout > 0) {
          updateUserBalance(payout);
        }
        return {
          ...bet,
          status: won ? 'WON' : 'LOST',
          multiplier: mult,
          payout,
        };
      })
    );
  };

  // Prediction Bet
  const placePredictionBet = (predictionId: string, choice: 'yes' | 'no', amount: number): boolean => {
    if (!currentUser) {
      setActiveAuthModal('login');
      return false;
    }
    if (currentUser.balance < amount) {
      setIsDepositOpen(true);
      return false;
    }

    const pred = predictions.find((p) => p.id === predictionId);
    if (!pred) return false;

    const odds = choice === 'yes' ? pred.yesOdds : pred.noOdds;
    const betId = placeBet({
      gameId: pred.id,
      gameName: `Prediction: ${pred.match}`,
      amount,
      multiplier: odds,
      payout: 0,
      status: 'PENDING',
      betType: 'prediction',
      details: `${choice.toUpperCase()}: ${pred.question} (@ ${odds}x)`,
    });

    if (betId) {
      // update prediction counts
      setPredictions((prev) =>
        prev.map((p) => {
          if (p.id !== predictionId) return p;
          return {
            ...p,
            options: {
              ...p.options,
              yesVotes: choice === 'yes' ? p.options.yesVotes + 1 : p.options.yesVotes,
              noVotes: choice === 'no' ? p.options.noVotes + 1 : p.options.noVotes,
            },
          };
        })
      );
      return true;
    }
    return false;
  };

  // Deposit & Withdrawal flows
  const submitDeposit = (amount: number, method: Transaction['method'], utr: string) => {
    if (!currentUser) return;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      userPhone: currentUser.phone,
      type: 'DEPOSIT',
      amount,
      method,
      utrNumber: utr,
      status: 'PENDING',
      createdAt: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsDepositOpen(false);
  };

  const submitWithdrawal = (amount: number, upiId: string, bankDetails?: Transaction['bankDetails']): boolean => {
    if (!currentUser) return false;
    if (currentUser.balance < amount) {
      showToast('Insufficient balance for withdrawal.');
      return false;
    }

    // Deduct pending balance immediately
    updateUserBalance(-amount);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: currentUser.id,
      userPhone: currentUser.phone,
      type: 'WITHDRAWAL',
      amount,
      method: bankDetails ? 'BANK_TRANSFER' : 'UPI_PHONEPE',
      upiId,
      bankDetails,
      status: 'PENDING',
      createdAt: 'Just now',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsWithdrawOpen(false);
    return true;
  };

  const approveTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx || tx.status !== 'PENDING') return;

    // Credit user if deposit
    if (tx.type === 'DEPOSIT') {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === tx.userId) {
            const updated = {
              ...u,
              balance: parseFloat((u.balance + tx.amount).toFixed(2)),
              totalDeposited: u.totalDeposited + tx.amount,
            };
            if (currentUser && currentUser.id === u.id) {
              setCurrentUser(updated);
            }
            return updated;
          }
          return u;
        })
      );
    } else {
      // Withdrawal approved - record total withdrawn
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === tx.userId) {
            const updated = {
              ...u,
              totalWithdrawn: u.totalWithdrawn + tx.amount,
            };
            if (currentUser && currentUser.id === u.id) {
              setCurrentUser(updated);
            }
            return updated;
          }
          return u;
        })
      );
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'APPROVED', processedAt: 'Just now' }
          : t
      )
    );
  };

  const rejectTransaction = (id: string, note?: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx || tx.status !== 'PENDING') return;

    // If withdrawal was rejected, refund the user!
    if (tx.type === 'WITHDRAWAL') {
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === tx.userId) {
            const updated = {
              ...u,
              balance: parseFloat((u.balance + tx.amount).toFixed(2)),
            };
            if (currentUser && currentUser.id === u.id) {
              setCurrentUser(updated);
            }
            return updated;
          }
          return u;
        })
      );
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'REJECTED', processedAt: 'Just now', adminNote: note || 'Transaction rejected by admin' }
          : t
      )
    );
  };

  // Sports & Odds updates
  const updateMatchOdds = (matchId: string, updates: Partial<SportsMatch>) => {
    setSportsMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
    );
  };

  const settleMatch = (matchId: string, winner: 'teamA' | 'teamB' | 'cancelled') => {
    const match = sportsMatches.find((m) => m.id === matchId);
    if (!match) return;

    // Settle bets on this match
    setUserBets((prev) =>
      prev.map((bet) => {
        if (bet.gameId !== matchId || bet.status !== 'PENDING') return bet;

        const isBackA = bet.details?.includes(match.teamA);
        const isBackB = bet.details?.includes(match.teamB);

        let won = false;
        if (winner === 'teamA' && isBackA) won = true;
        if (winner === 'teamB' && isBackB) won = true;

        if (winner === 'cancelled') {
          // Refund
          updateUserBalance(bet.amount);
          return { ...bet, status: 'WON', multiplier: 1, payout: bet.amount };
        }

        const payout = won ? parseFloat((bet.amount * bet.multiplier).toFixed(2)) : 0;
        if (won && payout > 0) {
          updateUserBalance(payout);
        }

        return {
          ...bet,
          status: won ? 'WON' : 'LOST',
          payout,
        };
      })
    );

    // Update match status
    updateMatchOdds(matchId, { status: 'COMPLETED' });
  };

  // Admin settings & User controls
  const updateAdminSettings = (settings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...settings }));
  };

  const adminUpdateUser = (userId: string, updates: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...updates };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const adminAddUserBalance = (userId: string, amount: number, isBonus = false) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = isBonus
            ? { ...u, bonusBalance: Math.max(0, u.bonusBalance + amount) }
            : { ...u, balance: Math.max(0, parseFloat((u.balance + amount).toFixed(2))) };
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  return (
    <GamingContext.Provider
      value={{
        currentUser,
        isAdmin,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        userBets,
        placeBet,
        settleBet,
        updateUserBalance,
        transactions,
        submitDeposit,
        submitWithdrawal,
        approveTransaction,
        rejectTransaction,
        liveBets,
        sportsMatches,
        predictions,
        placePredictionBet,
        updateMatchOdds,
        settleMatch,
        adminSettings,
        updateAdminSettings,
        allUsers,
        adminUpdateUser,
        adminAddUserBalance,
        activeGame,
        openGame: (id) => setActiveGame(id),
        closeGame: () => setActiveGame(null),
        activeAuthModal,
        openAuthModal: (mode = 'login') => setActiveAuthModal(mode),
        closeAuthModal: () => setActiveAuthModal(null),
        isDepositOpen,
        openDeposit: () => setIsDepositOpen(true),
        closeDeposit: () => setIsDepositOpen(false),
        isWithdrawOpen,
        openWithdraw: () => setIsWithdrawOpen(true),
        closeWithdraw: () => setIsWithdrawOpen(false),
        isReferralOpen,
        openReferral: () => setIsReferralOpen(true),
        closeReferral: () => setIsReferralOpen(false),
        sportsSlip,
        openSportsSlip: (slip) => setSportsSlip(slip),
        closeSportsSlip: () => setSportsSlip(null),
        isAdminView,
        setIsAdminView,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </GamingContext.Provider>
  );
};

export const useGaming = () => {
  const context = useContext(GamingContext);
  if (!context) {
    throw new Error('useGaming must be used within a GamingProvider');
  }
  return context;
};
