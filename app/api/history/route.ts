import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 })
  }

  try {
    // In production, fetch from database or index chain events
    const history = [
      {
        marketId: 5,
        question: "Will $DOGE hit $1 before $SHIB?",
        side: 1,
        amount: 100000000,
        outcome: "win",
        payout: 145000000,
        timestamp: Date.now() - 86400000,
      },
    ]

    return NextResponse.json({
      address,
      history,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status: 500 })
  }
}
