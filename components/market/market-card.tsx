"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Market } from "@/lib/types"
import { formatApt, formatCountdown, getPhaseLabel, getPhaseColor, formatPercentage } from "@/utils/format"
import { PHASE, CATEGORIES } from "@/lib/constants"
import { Clock, Users, Lock, Eye, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const [countdown, setCountdown] = useState("")

  const category = CATEGORIES.find((c) => c.id === market.category)
  const totalPool = market.yesPool + market.noPool
  const yesPercent = totalPool > 0 ? (market.yesPool / totalPool) * 100 : 50

  // Determine which end time to show based on phase
  const relevantEndTime = market.phase === PHASE.COMMIT ? market.commitEndTime : market.revealEndTime

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(formatCountdown(relevantEndTime))
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [relevantEndTime])

  // Phase icon
  const PhaseIcon =
    {
      [PHASE.COMMIT]: Lock,
      [PHASE.REVEAL]: Eye,
      [PHASE.RESOLVED]: CheckCircle,
      [PHASE.DISTRIBUTED]: CheckCircle,
      [PHASE.CREATED]: Clock,
    }[market.phase] || Clock

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline" className="shrink-0">
              {category?.icon} {category?.label || market.category}
            </Badge>
            <Badge className={getPhaseColor(market.phase)}>
              <PhaseIcon className="mr-1 h-3 w-3" />
              {getPhaseLabel(market.phase)}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {market.question}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pool visualization - hidden during commit phase */}
          {market.phase >= PHASE.REVEAL ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[oklch(0.65_0.2_145)]">YES {formatPercentage(market.yesPool, totalPool)}</span>
                <span className="text-[oklch(0.55_0.22_25)]">NO {formatPercentage(market.noPool, totalPool)}</span>
              </div>
              <div className="relative h-2 rounded-full bg-[oklch(0.55_0.22_25)]/30 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[oklch(0.65_0.2_145)] rounded-full transition-all"
                  style={{ width: `${yesPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatApt(market.yesPool)} APT</span>
                <span>{formatApt(market.noPool)} APT</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 rounded-lg bg-secondary/50 border border-dashed border-border">
              <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pool hidden until reveal</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{market.totalParticipants} predictions</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={market.phase <= PHASE.REVEAL ? "text-primary" : "text-muted-foreground"}>
                {countdown}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
