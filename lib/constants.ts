// Contract addresses (replace with deployed addresses)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xCAFE"
export const MODULE_NAME = "darkpool"

// Market phases
export const PHASE = {
  CREATED: 0,
  COMMIT: 1,
  REVEAL: 2,
  RESOLVED: 3,
  DISTRIBUTED: 4,
} as const

// Sides
export const SIDE = {
  YES: 1,
  NO: 2,
} as const

// Categories
export const CATEGORIES = [
  { id: "crypto", label: "Crypto", icon: "₿" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "trends", label: "Trends", icon: "📈" },
  { id: "weather", label: "Weather", icon: "🌤" },
  { id: "custom", label: "Community", icon: "👥" },
] as const

// XP levels
export const LEVELS = [
  { level: 1, xp: 0, title: "Novice" },
  { level: 2, xp: 100, title: "Apprentice" },
  { level: 3, xp: 300, title: "Trader" },
  { level: 4, xp: 600, title: "Expert" },
  { level: 5, xp: 1000, title: "Master" },
  { level: 6, xp: 1500, title: "Oracle" },
  { level: 7, xp: 2500, title: "Prophet" },
  { level: 8, xp: 4000, title: "Legend" },
  { level: 9, xp: 6000, title: "Mythic" },
  { level: 10, xp: 10000, title: "Darkpool Elite" },
] as const

// Pyth price feed IDs
export const PYTH_PRICE_FEEDS = {
  "BTC/USD": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  "ETH/USD": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "APT/USD": "0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5",
  "SOL/USD": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
} as const
