"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PhotonXPDisplay } from "@/components/ui/photon-xp-display"
import { useWallet } from "@/components/providers/wallet-provider"
import { useUserStats } from "@/hooks/use-user-stats"
import { Button } from "@/components/ui/button"
import { formatApt, truncateAddress } from "@/utils/format"
import { Wallet, TrendingUp, TrendingDown, DollarSign, History, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { address, connected, connect } = useWallet()
  const { stats, isLoading } = useUserStats()
  const { toast } = useToast()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({ title: "Address copied" })
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Connect your wallet to view your profile and prediction history.</p>
          <Button onClick={connect} size="lg">
            Connect Wallet
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {truncateAddress(address || "", 8, 6)}
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* XP Display */}
          <PhotonXPDisplay stats={stats} />

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Stats</CardTitle>
              <CardDescription>Your overall performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Total Predictions</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalPredictions}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Total Staked</span>
                  </div>
                  <p className="text-2xl font-bold">{formatApt(stats.totalStaked)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-[oklch(0.65_0.2_145)]/10 p-4 border border-[oklch(0.65_0.2_145)]/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-[oklch(0.65_0.2_145)]" />
                    <span className="text-xs text-muted-foreground">Total Won</span>
                  </div>
                  <p className="text-2xl font-bold text-[oklch(0.65_0.2_145)]">+{formatApt(stats.totalWon)}</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Win Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {stats.totalPredictions > 0 ? Math.round((stats.wins / stats.totalPredictions) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest predictions and outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Activity history coming soon</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
