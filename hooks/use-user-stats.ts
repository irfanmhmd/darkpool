"use client"

import useSWR from "swr"
import { useWallet } from "@/components/providers/wallet-provider"
import type { UserStats } from "@/lib/types"

const DEFAULT_STATS: UserStats = {
  totalPredictions: 0,
  wins: 0,
  losses: 0,
  totalStaked: 0,
  totalWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  xp: 0,
  level: 1,
}

// Demo stats - in production, fetch from chain
const DEMO_STATS: UserStats = {
  totalPredictions: 23,
  wins: 15,
  losses: 8,
  totalStaked: 45000000000, // 450 APT
  totalWon: 12500000000, // 125 APT profit
  currentStreak: 3,
  bestStreak: 7,
  xp: 1450,
  level: 5,
}

export function useUserStats() {
  const { address, connected } = useWallet()

  const { data, error, isLoading, mutate } = useSWR<UserStats>(
    connected && address ? `user-stats-${address}` : null,
    async () => {
      // In production, fetch from chain
      await new Promise((resolve) => setTimeout(resolve, 300))
      return DEMO_STATS
    },
    {
      refreshInterval: 60000,
    },
  )

  return {
    stats: data || DEFAULT_STATS,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
