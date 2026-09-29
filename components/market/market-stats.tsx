"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Market } from "@/lib/types"
import { formatApt, formatCountdown, formatDate } from "@/utils/format"
import { PHASE } from "@/lib/constants"
import { DollarSign, Users, Lock, Eye } from "lucide-react"
import { useEffect, useState } from "react"

interface MarketStatsProps {
  market: Market
}

export function MarketStats({ market }: MarketStatsProps) {
  const [countdown, setCountdown] = useState({ commit: "", reveal: "" })

  useEffect(() => {
    const update = () => {
      setCountdown({
        commit: formatCountdown(market.commitEndTime),
        reveal: formatCountdown(market.revealEndTime),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [market.commitEndTime, market.revealEndTime])

  const totalPool = market.yesPool + market.noPool
  const isPoolHidden = market.phase < PHASE.REVEAL

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Pool */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pool</p>
              {isPoolHidden ? (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Hidden
                </div>
              ) : (
                <p className="text-lg font-bold">{formatApt(totalPool)} APT</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Predictions</p>
              <p className="text-lg font-bold">{market.totalParticipants}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commit Phase */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                market.phase === PHASE.COMMIT ? "bg-primary/20" : "bg-muted"
              }`}
            >
              <Lock className={`h-5 w-5 ${market.phase === PHASE.COMMIT ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commit Phase</p>
              <p
                className={`text-sm font-medium ${
                  market.phase === PHASE.COMMIT ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {market.phase < PHASE.COMMIT ? "Pending" : market.phase === PHASE.COMMIT ? countdown.commit : "Ended"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reveal Phase */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                market.phase === PHASE.REVEAL ? "bg-accent/20" : "bg-muted"
              }`}
            >
              <Eye className={`h-5 w-5 ${market.phase === PHASE.REVEAL ? "text-accent" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reveal Phase</p>
              <p
                className={`text-sm font-medium ${
                  market.phase === PHASE.REVEAL ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {market.phase < PHASE.REVEAL
                  ? formatDate(market.commitEndTime)
                  : market.phase === PHASE.REVEAL
                    ? countdown.reveal
                    : "Ended"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
