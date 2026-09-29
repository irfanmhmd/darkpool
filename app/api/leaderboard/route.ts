import { NextResponse } from "next/server"

// Demo leaderboard data - in production, aggregate from chain events
const LEADERBOARD = [
  { address: "0x1234...abcd", xp: 12500, level: 10, wins: 89 },
  { address: "0x5678...efgh", xp: 9800, level: 9, wins: 72 },
  { address: "0x9abc...ijkl", xp: 7200, level: 8, wins: 58 },
]

export async function GET() {
  try {
    // In production, fetch from database or aggregate from chain
    return NextResponse.json({
      leaderboard: LEADERBOARD,
      updatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leaderboard" }, { status: 500 })
  }
}

// POST endpoint to update XP (called after claims)
export async function POST(request: Request) {
  try {
    const { address, xpGained, action } = await request.json()

    // In production, update database
    console.log(`XP Update: ${address} gained ${xpGained} XP for ${action}`)

    return NextResponse.json({
      success: true,
      message: "XP updated",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update XP" }, { status: 500 })
  }
}
