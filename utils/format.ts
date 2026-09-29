/**
 * Format APT amount from octas (1 APT = 100_000_000 octas)
 */
export function formatApt(octas: number | bigint): string {
  const apt = Number(octas) / 100_000_000
  return apt.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

/**
 * Parse APT to octas
 */
export function parseAptToOctas(apt: number | string): number {
  const value = typeof apt === "string" ? Number.parseFloat(apt) : apt
  return Math.floor(value * 100_000_000)
}

/**
 * Format countdown time
 */
export function formatCountdown(endTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = endTime - now

  if (diff <= 0) return "Ended"

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

/**
 * Format date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "50%"
  return ((value / total) * 100).toFixed(1) + "%"
}

/**
 * Truncate address
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return ""
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * Get phase label
 */
export function getPhaseLabel(phase: number): string {
  const labels: Record<number, string> = {
    0: "Created",
    1: "Commit Phase",
    2: "Reveal Phase",
    3: "Resolved",
    4: "Distributed",
  }
  return labels[phase] || "Unknown"
}

/**
 * Get phase color
 */
export function getPhaseColor(phase: number): string {
  const colors: Record<number, string> = {
    0: "bg-muted text-muted-foreground",
    1: "bg-primary/20 text-primary",
    2: "bg-accent/20 text-accent",
    3: "bg-success/20 text-success",
    4: "bg-muted text-muted-foreground",
  }
  return colors[phase] || "bg-muted text-muted-foreground"
}
