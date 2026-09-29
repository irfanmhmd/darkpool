export interface Market {
  id: number
  creator: string
  question: string
  category: string
  marketType: string
  commitEndTime: number
  revealEndTime: number
  phase: number
  yesPool: number
  noPool: number
  totalCommitted: number
  winnerSide: number
  oraclePrice: number
  totalParticipants: number
  totalRevealed: number
}

export interface Commitment {
  commitHash: string
  amount: number
  revealed: boolean
  side: number
  claimed: boolean
}

export interface UserStats {
  totalPredictions: number
  wins: number
  losses: number
  totalStaked: number
  totalWon: number
  currentStreak: number
  bestStreak: number
  xp: number
  level: number
}

export interface StoredCommitment {
  marketId: number
  side: number
  amount: number
  salt: string
  commitHash: string
  timestamp: number
}

export interface PriceData {
  price: number
  confidence: number
  timestamp: number
}
