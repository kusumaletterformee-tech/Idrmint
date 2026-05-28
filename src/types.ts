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

