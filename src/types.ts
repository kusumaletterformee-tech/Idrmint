export type EWalletType = 'DANA' | 'GOPAY' | 'OVO' | 'LINKAJA';

export interface ReferredUser {
  id: string;
  username: string;
  joinedAt: string;
  hashRateBonus: number; // in KH/s
  status: 'Active' | 'Inactive';
}

export interface PayoutTransaction {
  id: string;
  userId?: string;
  username?: string;
  timestamp: string;
  amount: number;
  walletType: EWalletType;
  walletNumber: string;
  txHash: string; // Dynamic simulated end-to-end encryption hash
  status: 'Processing' | 'Completed' | 'Failed';
}

export interface DepositTransaction {
  id: string;
  userId?: string;
  username?: string;
  timestamp: string;
  amount: number;
  paymentMethod: 'QRIS';
  status: 'Pending' | 'Completed' | 'Expired';
  referenceNumber: string;
  userConfirmed?: boolean;
}

export interface MiningLog {
  timestamp: string;
  blockHeight: number;
  nonce: number;
  hash: string;
  reward: number;
  algorithm: string;
}

export interface MiningConfig {
  balancePenampungan: number; // Dompet Imigrasi Penampungan
  balanceEWallet: number; // Balance in user's linked e-wallet
  totalMined: number;
  baseHashRate: number; // in KH/s
  boostMultiplier: number; // overall referral multiplier multiplier
  isMiningActive: boolean;
  referralCode: string;
  referredBy: string | null;
  referrals: ReferredUser[];
  autoWithdrawActive: boolean;
  targetEWallet: EWalletType;
  walletNumber: string;
  payoutThreshold: number; // e.g., Rp 10.000
  payoutProgress: number; // percent toward next automated payout check
  payoutHistory: PayoutTransaction[];
  depositHistory: DepositTransaction[];
  privateKey: string; // Client-side simulated mining encryption private key
  publicKey: string;
  miningSessionExpiry?: number; // 24-hour cycle session expiry timestamp in ms
  lastMinedAt?: number; // timestamp in ms of last background mining calculation
  machineActiveDays?: number;
  rentedRigs?: string[];
  lastSettleWithdrawAt?: number;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHex: string;
  isAdmin: boolean;
  miningConfig: MiningConfig;
  joinedAt: string;
}

export interface MiningRigItem {
  id: string;
  name: string;
  hashPower: number; // in KH/s
  price: number; // in Rupiah (from balanceEWallet)
  efficiency: string;
  description: string;
  durabilityDays: number;
}

export const MINING_RIGS: MiningRigItem[] = [
  {
    id: 'rig-bronze',
    name: 'Antminer S9 - IDR Lite edition',
    hashPower: 15.0,
    price: 15000,
    efficiency: '88%',
    description: 'Mesin entry-level hemat daya dengan booster akselerasi Cloud. Pemecahan block hash stabil konstan.',
    durabilityDays: 30
  },
  {
    id: 'rig-silver',
    name: 'WhatsMiner M30S - IDR Medium',
    hashPower: 45.0,
    price: 45000,
    efficiency: '94%',
    description: 'Hashrate super stabil tinggi dioptimalkan secara dinamis untuk kolam penambangan regional Asia-Tenggara.',
    durabilityDays: 60
  },
  {
    id: 'rig-gold',
    name: 'AvalonMade 1246 - IDR Extreme Pro',
    hashPower: 150.0,
    price: 100000,
    efficiency: '99%',
    description: 'Sewa rig tingkat industri gaban bertenaga tinggi dengan sistem asimetris terenkripsi 256-bit penuh.',
    durabilityDays: 90
  }
];

export const DEFAULT_CLIENT_USERS: UserAccount[] = [
  {
    id: "UID-KUSUMAX",
    username: "Kusumax",
    email: "kusumax@idrminer.com",
    passwordHex: "admin123",
    isAdmin: true,
    joinedAt: "27/5/2026",
    miningConfig: {
      balancePenampungan: 125000,
      balanceEWallet: 500000,
      totalMined: 625000,
      baseHashRate: 20.0,
      boostMultiplier: 1.0,
      isMiningActive: true,
      referralCode: "IDR-KUSUMAX",
      referredBy: null,
      referrals: [],
      autoWithdrawActive: false,
      targetEWallet: "DANA",
      walletNumber: "081234567890",
      payoutThreshold: 50000,
      payoutProgress: 45,
      payoutHistory: [],
      depositHistory: [],
      privateKey: "",
      publicKey: "",
      machineActiveDays: 3,
      rentedRigs: []
    }
  },
  {
    id: "UID-10001",
    username: "admin",
    email: "admin@idrminer.com",
    passwordHex: "admin123",
    isAdmin: true,
    joinedAt: "25/5/2026",
    miningConfig: {
      balancePenampungan: 1421034,
      balanceEWallet: 1000000,
      totalMined: 1421034,
      baseHashRate: 15.0,
      boostMultiplier: 1.0,
      isMiningActive: true,
      referralCode: "IDR-ADMN",
      referredBy: null,
      referrals: [],
      autoWithdrawActive: false,
      targetEWallet: "DANA",
      walletNumber: "081211112222",
      payoutThreshold: 10000,
      payoutProgress: 0,
      payoutHistory: [],
      depositHistory: [],
      privateKey: "",
      publicKey: "",
      machineActiveDays: 3,
      rentedRigs: []
    }
  },
  {
    id: "UID-10002",
    username: "jokowow",
    email: "joko@gmail.com",
    passwordHex: "user123",
    isAdmin: false,
    joinedAt: "25/5/2026",
    miningConfig: {
      balancePenampungan: 18450,
      balanceEWallet: 54000,
      totalMined: 72450,
      baseHashRate: 4.8,
      boostMultiplier: 1.0,
      isMiningActive: true,
      referralCode: "IDR-F7X8",
      referredBy: null,
      referrals: [],
      autoWithdrawActive: true,
      targetEWallet: "DANA",
      walletNumber: "081298765432",
      payoutThreshold: 50000,
      payoutProgress: 36,
      payoutHistory: [
        {
          id: "TXN-842911",
          userId: "UID-10002",
          username: "jokowow",
          timestamp: "25/5/2026, 14:12:00",
          amount: 35000,
          walletType: "DANA",
          walletNumber: "081298765432",
          txHash: "0x3a8b417fcd9e02c59de104a8b7ddf2bb89a19c636f014e3da8f7c9e0cba002ae",
          status: "Completed"
        }
      ],
      depositHistory: [
        {
          id: "QRS-41829",
          userId: "UID-10002",
          username: "jokowow",
          timestamp: "25/5/2026, 11:05:00",
          amount: 25000,
          paymentMethod: "QRIS",
          status: "Completed",
          referenceNumber: "REF-XZ901248KLPB"
        }
      ],
      privateKey: "",
      publicKey: "",
      machineActiveDays: 3,
      rentedRigs: []
    }
  }
];


