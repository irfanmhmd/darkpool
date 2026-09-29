import { sha3_256 } from "js-sha3"

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Generate commitment hash for the darkpool
 * hash = sha3_256(side || amount || salt || userAddress)
 */
export function generateCommitHash(side: number, amount: number, salt: string, userAddress: string): string {
  // Concatenate all values as hex strings
  const sideHex = side.toString(16).padStart(2, "0")
  const amountHex = amount.toString(16).padStart(16, "0")
  const addressClean = userAddress.startsWith("0x") ? userAddress.slice(2) : userAddress

  const data = sideHex + amountHex + salt + addressClean
  const hash = sha3_256(data)

  return "0x" + hash
}

/**
 * Verify a commitment hash
 */
export function verifyCommitHash(
  commitHash: string,
  side: number,
  amount: number,
  salt: string,
  userAddress: string,
): boolean {
  const computed = generateCommitHash(side, amount, salt, userAddress)
  return computed.toLowerCase() === commitHash.toLowerCase()
}

/**
 * Convert hex string to Uint8Array for Move
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16)
  }
  return bytes
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
