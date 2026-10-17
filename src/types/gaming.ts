export type GameCategory = 
  | 'explore'
  | 'casino'
  | 'fantasy'
  | 'rummy'
  | 'sports'
  | 'originals'
  | 'slots'
  | 'fishing'
  | 'mini-game'
  | 'table';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  balance: number;
  bonusBalance: number;
  role: UserRole;
  isBanned: boolean;
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  totalDeposited: number;
  totalWithdrawn: number;
  createdAt: string;
}

export interface GameItem {
  id: string;
  title: string;
  subtitle?: string;
  tag?: 'HOT' | 'NEW' | 'ORIGINALS' | '99% RTP';
  category: GameCategory;
  subCategory?: string;
  playersCount: number;
  iconType: string;
  accentColor: string;
  bgGradient: string;
  isPlayable: boolean;
  isMaintenance?: boolean;
}

export interface LiveBetFeedItem {
  id: string;
  game: string;
  player: string;
  payout: number;
  currency: string;
  timeAgo: string;
  icon?: string;
}

export interface PredictionItem {
  id: string;
  match: string;
  question: string;
  category: 'Cricket' | 'Football';
  yesOdds: number;
  noOdds: number;
  isTrending: boolean;
  totalPool: string;
  options: {
    yesVotes: number;
    noVotes: number;
  };
}

export interface SportsMatch {
  id: string;
  tournament: string;
  format: 'T20' | 'ODI' | 'Test' | 'Football' | 'E-Cricket';
  category: 'Cricket' | 'Football';
  teamA: string;
  teamB: string;
  teamAShort: string;
  teamBShort: string;
  flagA: string;
  flagB: string;
  status: 'IN-PLAY' | 'TODAY' | 'EARLY' | 'COMPLETED';
  startTime: string;
  scoreA?: string;
  scoreB?: string;
  overs?: string;
  prizePool?: string;
  backOddsA: number;
  layOddsA: number;
  backOddsB: number;
  layOddsB: number;
  isSuspended?: boolean;
}

export interface RummyTable {
  id: string;
  name: string;
  type: 'POINTS' | 'DEALS' | 'POOL';
  players: '2P' | '6P';
  entryFee: number;
  prize: number;
  activePlayers: number;
}

export interface Bet {
  id: string;
  userId: string;
  userName: string;
  gameId: string;
  gameName: string;
  amount: number;
  multiplier: number;
  payout: number;
  status: 'PENDING' | 'WON' | 'LOST';
  betType: 'casino' | 'sports' | 'prediction' | 'fantasy';
  details?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userPhone: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  method: 'UPI_PHONEPE' | 'UPI_GPAY' | 'UPI_PAYTM' | 'BANK_TRANSFER';
  upiId?: string;
  utrNumber?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    holderName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface AdminSettings {
  aviatorRigging: 'fair' | 'house_favour' | 'high_multiplier' | 'custom_next';
  customNextMultiplier?: number;
  minesWinRate: number; // 0 to 100%
  referralBonus: number; // e.g. 110
  upiPaymentId: string; // e.g. gamingpay@upi
  upiPayeeName: string;
  minDeposit: number;
  minWithdrawal: number;
  siteAnnouncement: string;
  maintenanceMode: boolean;
}
