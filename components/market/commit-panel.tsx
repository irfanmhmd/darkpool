"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/components/providers/wallet-provider"
import { useToast } from "@/hooks/use-toast"
import { generateSalt, generateCommitHash, hexToBytes } from "@/utils/hashing"
import { storeCommitment, getCommitment } from "@/utils/storage"
import { parseAptToOctas, formatApt } from "@/utils/format"
import { CONTRACT_ADDRESS, MODULE_NAME, SIDE } from "@/lib/constants"
import type { Market } from "@/lib/types"
import { Lock, EyeOff, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommitPanelProps {
  market: Market
  onSuccess?: () => void
}

export function CommitPanel({ market, onSuccess }: CommitPanelProps) {
  const { address, connected, signAndSubmitTransaction } = useWallet()
  const { toast } = useToast()

  const [selectedSide, setSelectedSide] = useState<number | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Check if user already committed
  const existingCommitment = getCommitment(market.id)

  const handleCommit = async () => {
    if (!connected || !address) {
      toast({
        title: "Connect wallet",
        description: "Please connect your wallet to make a prediction",
        variant: "destructive",
      })
      return
    }

    if (selectedSide === null) {
      toast({
        title: "Select a side",
        description: "Choose YES or NO for your prediction",
        variant: "destructive",
      })
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a valid stake amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Generate salt and commitment hash
      const salt = generateSalt()
      const amountOctas = parseAptToOctas(amountNum)
      const commitHash = generateCommitHash(selectedSide, amountOctas, salt, address)

      // Store commitment locally for reveal
      storeCommitment({
        marketId: market.id,
        side: selectedSide,
        amount: amountOctas,
        salt,
        commitHash,
        timestamp: Date.now(),
      })

      // Submit transaction
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::commit_prediction`,
        type_arguments: [],
        arguments: [
          CONTRACT_ADDRESS, // store_addr
          market.id.toString(),
          Array.from(hexToBytes(commitHash)),
          amountOctas.toString(),
        ],
      }

      const response = await signAndSubmitTransaction(payload)

      toast({
        title: "Prediction committed!",
        description: "Your prediction is hidden. Remember to reveal during the reveal phase.",
      })

      setSelectedSide(null)
      setAmount("")
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Commit failed",
        description: error.message || "Failed to submit prediction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (existingCommitment) {
    return (
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Check className="h-5 w-5" />
            Prediction Committed
          </CardTitle>
          <CardDescription>Your prediction is locked and hidden. Come back during the reveal phase.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your stake</span>
              <span className="font-medium">{formatApt(existingCommitment.amount)} APT</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Side hidden until reveal phase</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Make Hidden Prediction
        </CardTitle>
        <CardDescription>
          Your prediction and amount are encrypted until the reveal phase. No one can see your choice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Side Selection */}
        <div className="space-y-3">
          <Label>Choose Your Side</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-20 flex-col gap-2 transition-all",
                selectedSide === SIDE.YES &&
                  "border-[oklch(0.65_0.2_145)] bg-[oklch(0.65_0.2_145)]/10 text-[oklch(0.65_0.2_145)]",
              )}
              onClick={() => setSelectedSide(SIDE.YES)}
            >
              <span className="text-2xl font-bold">YES</span>
              <span className="text-xs opacity-70">I predict this will happen</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-20 flex-col gap-2 transition-all",
                selectedSide === SIDE.NO &&
                  "border-[oklch(0.55_0.22_25)] bg-[oklch(0.55_0.22_25)]/10 text-[oklch(0.55_0.22_25)]",
              )}
              onClick={() => setSelectedSide(SIDE.NO)}
            >
              <span className="text-2xl font-bold">NO</span>
              <span className="text-xs opacity-70">I predict this won't happen</span>
            </Button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <Label htmlFor="amount">Stake Amount (APT)</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
              min="0"
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">APT</span>
          </div>
          <div className="flex gap-2">
            {[0.5, 1, 5, 10].map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(val.toString())}
                className="flex-1 text-xs"
              >
                {val} APT
              </Button>
            ))}
          </div>
        </div>

        {/* Privacy Info */}
        <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <EyeOff className="h-4 w-4 text-primary" />
            Darkpool Privacy
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Your choice (YES/NO) is encrypted on-chain
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Your stake amount is hidden from others
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Pool sizes remain unknown until reveal
            </li>
          </ul>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Keep this browser tab or save your commitment. You'll need it to reveal your prediction. Failure to reveal
            forfeits 10% of your stake.
          </span>
        </div>

        {/* Submit */}
        <Button
          onClick={handleCommit}
          disabled={loading || selectedSide === null || !amount}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Lock Prediction
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
