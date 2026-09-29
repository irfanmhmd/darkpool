"use client"

import { use } from "react"
import { Header } from "@/components/layout/header"
import { CommitPanel } from "@/components/market/commit-panel"
import { RevealPanel } from "@/components/market/reveal-panel"
import { ResultPanel } from "@/components/market/result-panel"
import { MarketStats } from "@/components/market/market-stats"
import { PoolVisualization } from "@/components/market/pool-visualization"
import { useMarket } from "@/hooks/use-markets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPhaseLabel, getPhaseColor } from "@/utils/format"
import { PHASE, CATEGORIES } from "@/lib/constants"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

interface MarketPageProps {
  params: Promise<{ id: string }>
}

export default function MarketPage({ params }: MarketPageProps) {
  const { id } = use(params)
  const marketId = Number.parseInt(id)
  const { market, isLoading, refresh } = useMarket(marketId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-12 w-3/4 bg-muted rounded" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Markets
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  const category = CATEGORIES.find((c) => c.id === market.category)

  // Render the appropriate panel based on phase
  const renderActionPanel = () => {
    switch (market.phase) {
      case PHASE.COMMIT:
        return <CommitPanel market={market} onSuccess={refresh} />
      case PHASE.REVEAL:
        return <RevealPanel market={market} onSuccess={refresh} />
      case PHASE.RESOLVED:
      case PHASE.DISTRIBUTED:
        return <ResultPanel market={market} onClaim={refresh} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Markets
        </Link>

        {/* Market Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline">
              {category?.icon} {category?.label || market.category}
            </Badge>
            <Badge className={getPhaseColor(market.phase)}>{getPhaseLabel(market.phase)}</Badge>
            {market.marketType === "crypto" && (
              <Badge variant="outline" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Pyth Oracle
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-balance">{market.question}</h1>
        </div>

        {/* Stats */}
        <MarketStats market={market} />

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-2 mt-8">
          {/* Pool Visualization */}
          <PoolVisualization market={market} />

          {/* Action Panel */}
          {renderActionPanel()}
        </div>
      </main>
    </div>
  )
}
