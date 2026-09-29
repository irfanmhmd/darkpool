"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Market } from "@/lib/types"
import { formatApt, formatPercentage } from "@/utils/format"
import { PHASE, SIDE } from "@/lib/constants"
import { Lock, TrendingUp, TrendingDown } from "lucide-react"

interface PoolVisualizationProps {
  market: Market
}

export function PoolVisualization({ market }: PoolVisualizationProps) {
  const isPoolHidden = market.phase < PHASE.REVEAL
  const totalPool = market.yesPool + market.noPool
  const yesPercent = totalPool > 0 ? (market.yesPool / totalPool) * 100 : 50
  const noPercent = totalPool > 0 ? (market.noPool / totalPool) * 100 : 50

  if (isPoolHidden) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Pool Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-24 w-24 rounded-full border-4 border-dashed border-border flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Pool sizes are hidden during the commit phase</p>
            <p className="text-xs text-muted-foreground mt-1">Will be revealed when reveal phase begins</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pool Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Bar */}
        <div className="space-y-2">
          <div className="flex h-12 rounded-lg overflow-hidden">
            <div
              className="bg-[oklch(0.65_0.2_145)] flex items-center justify-center transition-all"
              style={{ width: `${yesPercent}%`, minWidth: "20%" }}
            >
              <span className="text-sm font-bold text-[oklch(0.13_0.01_260)]">
                {formatPercentage(market.yesPool, totalPool)}
              </span>
            </div>
            <div
              className="bg-[oklch(0.55_0.22_25)] flex items-center justify-center transition-all"
              style={{ width: `${noPercent}%`, minWidth: "20%" }}
            >
              <span className="text-sm font-bold text-white">{formatPercentage(market.noPool, totalPool)}</span>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[oklch(0.65_0.2_145)]/10 p-4 border border-[oklch(0.65_0.2_145)]/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[oklch(0.65_0.2_145)]" />
              <span className="font-medium text-[oklch(0.65_0.2_145)]">YES Pool</span>
            </div>
            <p className="text-2xl font-bold">{formatApt(market.yesPool)}</p>
            <p className="text-xs text-muted-foreground">APT staked</p>
            {market.winnerSide === SIDE.YES && (
              <div className="mt-2 text-xs font-medium text-[oklch(0.65_0.2_145)]">Winner</div>
            )}
          </div>

          <div className="rounded-lg bg-[oklch(0.55_0.22_25)]/10 p-4 border border-[oklch(0.55_0.22_25)]/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-[oklch(0.55_0.22_25)]" />
              <span className="font-medium text-[oklch(0.55_0.22_25)]">NO Pool</span>
            </div>
            <p className="text-2xl font-bold">{formatApt(market.noPool)}</p>
            <p className="text-xs text-muted-foreground">APT staked</p>
            {market.winnerSide === SIDE.NO && (
              <div className="mt-2 text-xs font-medium text-[oklch(0.55_0.22_25)]">Winner</div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Pool</span>
            <span className="text-lg font-bold">{formatApt(totalPool)} APT</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
