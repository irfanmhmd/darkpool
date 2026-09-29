"use client"

import useSWR from "swr"
import type { Market } from "@/lib/types"

// Sample markets for demo - in production, fetch from chain
const SAMPLE_MARKETS: Market[] = [
  {
    id: 1,
    creator: "0xCAFE",
    question: "Will BTC exceed $150,000 by end of Q1 2025?",
    category: "crypto",
    marketType: "crypto",
    commitEndTime: Math.floor(Date.now() / 1000) + 86400, // 24h from now
    revealEndTime: Math.floor(Date.now() / 1000) + 172800, // 48h from now
    phase: 1, // COMMIT
    yesPool: 0,
    noPool: 0,
    totalCommitted: 15000000000, // 150 APT in octas
    winnerSide: 0,
    oraclePrice: 0,
    totalParticipants: 47,
    totalRevealed: 0,
  },
  {
    id: 2,
    creator: "0xCAFE",
    question: "Will Ethereum flip Bitcoin in market cap this cycle?",
    category: "crypto",
    marketType: "crypto",
    commitEndTime: Math.floor(Date.now() / 1000) - 3600, // Ended
    revealEndTime: Math.floor(Date.now() / 1000) + 82800, // 23h from now
    phase: 2, // REVEAL
    yesPool: 8500000000,
    noPool: 12300000000,
    totalCommitted: 20800000000,
    winnerSide: 0,
    oraclePrice: 0,
    totalParticipants: 89,
    totalRevealed: 62,
  },
  {
    id: 3,
    creator: "0xCAFE",
    question: "Will APT reach $50 before end of January 2025?",
    category: "crypto",
    marketType: "crypto",
    commitEndTime: Math.floor(Date.now() / 1000) + 43200,
    revealEndTime: Math.floor(Date.now() / 1000) + 129600,
    phase: 1, // COMMIT
    yesPool: 0,
    noPool: 0,
    totalCommitted: 5000000000,
    winnerSide: 0,
    oraclePrice: 0,
    totalParticipants: 23,
    totalRevealed: 0,
  },
  {
    id: 4,
    creator: "0xCAFE",
    question: "Will the 49ers win Super Bowl LIX?",
    category: "sports",
    marketType: "sports",
    commitEndTime: Math.floor(Date.now() / 1000) + 604800,
    revealEndTime: Math.floor(Date.now() / 1000) + 691200,
    phase: 1, // COMMIT
    yesPool: 0,
    noPool: 0,
    totalCommitted: 7500000000,
    winnerSide: 0,
    oraclePrice: 0,
    totalParticipants: 156,
    totalRevealed: 0,
  },
  {
    id: 5,
    creator: "0xCAFE",
    question: "Will $DOGE hit $1 before $SHIB?",
    category: "trends",
    marketType: "meme",
    commitEndTime: Math.floor(Date.now() / 1000) - 86400,
    revealEndTime: Math.floor(Date.now() / 1000) - 7200,
    phase: 3, // RESOLVED
    yesPool: 3200000000,
    noPool: 2800000000,
    totalCommitted: 6000000000,
    winnerSide: 1, // YES
    oraclePrice: 100000000, // $1.00
    totalParticipants: 234,
    totalRevealed: 198,
  },
  {
    id: 6,
    creator: "0xCAFE",
    question: "Will NYC have a white Christmas 2024?",
    category: "weather",
    marketType: "weather",
    commitEndTime: Math.floor(Date.now() / 1000) + 259200,
    revealEndTime: Math.floor(Date.now() / 1000) + 345600,
    phase: 1, // COMMIT
    yesPool: 0,
    noPool: 0,
    totalCommitted: 1200000000,
    winnerSide: 0,
    oraclePrice: 0,
    totalParticipants: 45,
    totalRevealed: 0,
  },
]

const fetcher = async (): Promise<Market[]> => {
  // In production, this would fetch from the Aptos blockchain
  // For demo, return sample data
  await new Promise((resolve) => setTimeout(resolve, 500))
  return SAMPLE_MARKETS
}

export function useMarkets() {
  const { data, error, isLoading, mutate } = useSWR<Market[]>("markets", fetcher, {
    refreshInterval: 30000, // Refresh every 30s
    revalidateOnFocus: true,
  })

  return {
    markets: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useMarket(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Market | null>(
    `market-${id}`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return SAMPLE_MARKETS.find((m) => m.id === id) || null
    },
    {
      refreshInterval: 10000,
    },
  )

  return {
    market: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
