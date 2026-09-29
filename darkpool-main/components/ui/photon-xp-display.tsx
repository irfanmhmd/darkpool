"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LEVELS } from "@/lib/constants"
import type { UserStats } from "@/lib/types"
import { Zap, Flame, Trophy, Target } from "lucide-react"

interface PhotonXPDisplayProps {
  stats: UserStats
  compact?: boolean
}

export function PhotonXPDisplay({ stats, compact = false }: PhotonXPDisplayProps) {
  // Find current and next level
  const currentLevelData = LEVELS.find((l) => l.level === stats.level) || LEVELS[0]
  const nextLevelData = LEVELS.find((l) => l.level === stats.level + 1)

  const xpForCurrentLevel = currentLevelData.xp
  const xpForNextLevel = nextLevelData?.xp || currentLevelData.xp + 1000
  const xpProgress = ((stats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
          {stats.level}
        </div>
        <div>
          <p className="text-sm font-medium">{currentLevelData.title}</p>
          <p className="text-xs text-muted-foreground">{stats.xp} XP</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Level Badge */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary">
              <span className="text-2xl font-bold">{stats.level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Zap className="h-3 w-3" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">{currentLevelData.title}</p>
            <p className="text-sm text-muted-foreground">{stats.xp.toLocaleString()} XP</p>
          </div>
        </div>

        {/* XP Progress */}
        {nextLevelData && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Level {nextLevelData.level}</span>
              <span>{xpForNextLevel - stats.xp} XP needed</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{stats.wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Flame className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-xl font-bold">{stats.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Target className="h-5 w-5 mx-auto mb-1 text-chart-3" />
            <p className="text-xl font-bold">
              {stats.totalPredictions > 0 ? Math.round((stats.wins / stats.totalPredictions) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
