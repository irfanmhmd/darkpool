import { NextResponse } from "next/server"
import { PYTH_PRICE_FEEDS } from "@/lib/constants"

// Pyth Hermes API endpoint
const PYTH_HERMES_URL = "https://hermes.pyth.network/api/latest_price_feeds"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "BTC/USD"

  try {
    const feedId = PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS]

    if (!feedId) {
      return NextResponse.json({ error: "Unknown price feed" }, { status: 400 })
    }

    const response = await fetch(`${PYTH_HERMES_URL}?ids[]=${feedId}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      throw new Error("Failed to fetch price")
    }

    const data = await response.json()
    const priceData = data[0]

    if (!priceData) {
      throw new Error("No price data available")
    }

    // Parse Pyth price format
    const price = Number.parseFloat(priceData.price.price) * Math.pow(10, priceData.price.expo)
    const confidence = Number.parseFloat(priceData.price.conf) * Math.pow(10, priceData.price.expo)

    return NextResponse.json({
      symbol,
      price,
      confidence,
      timestamp: priceData.price.publish_time,
    })
  } catch (error: any) {
    console.error("Price fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch price" }, { status: 500 })
  }
}
