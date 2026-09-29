"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/providers/wallet-provider"
import { useToast } from "@/hooks/use-toast"
import { formatApt } from "@/utils/format"
import { CONTRACT_ADDRESS, MODULE_NAME, SIDE } from "@/lib/constants"
import type { Market, Commitment } from "@/lib/types"
import { Trophy, XCircle, Gift, Loader2 } from "lucide-react"

interface ResultPanelProps {
  market: Market
  userCommitment?: Commitment
  onClaim?: () => void
}

export function ResultPanel({ market, userCommitment, onClaim }: ResultPanelProps) {
  const { address, connected, signAndSubmitTransaction } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const isWinner = userCommitment?.side === market.winnerSide
  const winnerLabel = market.winnerSide === SIDE.YES ? "YES" : "NO"

  // Calculate potential payout
  const calculatePayout = () => {
    if (!userCommitment || !isWinner) return 0

    const winningPool = market.winnerSide === SIDE.YES ? market.yesPool : market.noPool
    const losingPool = market.winnerSide === SIDE.YES ? market.noPool : market.yesPool

    if (winningPool === 0) return userCommitment.amount

    const rewardShare = (userCommitment.amount * losingPool) / winningPool
    const fee = (rewardShare * 250) / 10000 // 2.5% fee
    const netReward = rewardShare - fee

    return userCommitment.amount + netReward
  }

  const payout = calculatePayout()

  const handleClaim = async () => {
    if (!connected || !address) {
      toast({
        title: "Connect wallet",
        description: "Please connect your wallet to claim",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::claim`,
        type_arguments: [],
        arguments: [CONTRACT_ADDRESS, market.id.toString()],
      }

      await signAndSubmitTransaction(payload)

      toast({
        title: "Claimed!",
        description: isWinner ? `You won ${formatApt(payout)} APT!` : "Better luck next time!",
      })

      onClaim?.()
    } catch (error: any) {
      toast({
        title: "Claim failed",
        description: error.message || "Failed to claim",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userCommitment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Market Resolved
          </CardTitle>
          <CardDescription>
            The outcome is{" "}
            <span
              className={`font-bold ${
                market.winnerSide === SIDE.YES ? "text-[oklch(0.65_0.2_145)]" : "text-[oklch(0.55_0.22_25)]"
              }`}
            >
              {winnerLabel}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You didn't participate in this market.</p>
        </CardContent>
      </Card>
    )
  }

  if (userCommitment.claimed) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">Already Claimed</CardTitle>
          <CardDescription>
            You have already claimed your {isWinner ? "winnings" : "result"} for this market.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={isWinner ? "border-primary/50 glow-primary" : "border-destructive/50"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isWinner ? (
            <>
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-primary">You Won!</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">Better Luck Next Time</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          The outcome was{" "}
          <span
            className={`font-bold ${
              market.winnerSide === SIDE.YES ? "text-[oklch(0.65_0.2_145)]" : "text-[oklch(0.55_0.22_25)]"
            }`}
          >
            {winnerLabel}
          </span>
          {". "}
          You predicted {userCommitment.side === SIDE.YES ? "YES" : "NO"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payout Details */}
        <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Stake</span>
            <span>{formatApt(userCommitment.amount)} APT</span>
          </div>
          {isWinner && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Winnings</span>
                <span className="text-primary">+{formatApt(payout - userCommitment.amount)} APT</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between font-bold">
                <span>Total Payout</span>
                <span className="text-primary">{formatApt(payout)} APT</span>
              </div>
            </>
          )}
        </div>

        {/* Claim Button */}
        {isWinner && (
          <Button onClick={handleClaim} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Claim {formatApt(payout)} APT
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
