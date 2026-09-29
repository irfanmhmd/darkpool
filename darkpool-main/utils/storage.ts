import type { StoredCommitment } from "@/lib/types"

const STORAGE_KEY = "darkpool_commitments"

/**
 * Store a commitment in localStorage for later reveal
 */
export function storeCommitment(commitment: StoredCommitment): void {
  const stored = getStoredCommitments()
  const key = `${commitment.marketId}`
  stored[key] = commitment

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }
}

/**
 * Get all stored commitments
 */
export function getStoredCommitments(): Record<string, StoredCommitment> {
  if (typeof window === "undefined") return {}

  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return {}

  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

/**
 * Get a specific commitment by market ID
 */
export function getCommitment(marketId: number): StoredCommitment | null {
  const stored = getStoredCommitments()
  return stored[`${marketId}`] || null
}

/**
 * Remove a commitment after successful reveal
 */
export function removeCommitment(marketId: number): void {
  const stored = getStoredCommitments()
  delete stored[`${marketId}`]

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }
}

/**
 * Clear all stored commitments
 */
export function clearCommitments(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}
