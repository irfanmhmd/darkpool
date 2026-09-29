"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LEVELS } from "@/lib/constants"
import { Trophy, Medal, Flame, TrendingUp } from "lucide-react"

// Demo leaderboard data
const LEADERBOARD_DATA = [
  { address: "0x1234...abcd", xp: 12500, level: 10, wins: 89, streak: 12, totalWon: 45000000000 },
  { address: "0x5678...efgh", xp: 9800, level: 9, wins: 72, streak: 8, totalWon: 38000000000 },
  { address: "0x9abc...ijkl", xp: 7200, level: 8, wins: 58, streak: 5, totalWon: 29000000000 },
  { address: "0xdef0...mnop", xp: 5500, level: 7, wins: 45, streak: 3, totalWon: 22000000000 },
  { address: "0x1357...qrst", xp: 4200, level: 6, wins: 38, streak: 6, totalWon: 18000000000 },
  { address: "0x2468...uvwx", xp: 3100, level: 5, wins: 29, streak: 2, totalWon: 14000000000 },
  { address: "0x3579...yzab", xp: 2400, level: 4, wins: 22, streak: 4, totalWon: 11000000000 },
  { address: "0x4680...cdef", xp: 1800, level: 3, wins: 17, streak: 1, totalWon: 8000000000 },
  { address: "0x5791...ghij", xp: 1200, level: 3, wins: 12, streak: 0, totalWon: 5000000000 },
  { address: "0x6802...klmn", xp: 800, level: 2, wins: 8, streak: 2, totalWon: 3000000000 },
]

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
  }

  const getLevelTitle = (level: number) => {
    return LEVELS.find((l) => l.level === level)?.title || "Unknown"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top predictors ranked by Photon XP</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-gray-400">
                <AvatarFallback className="bg-secondary text-lg">
                  {LEADERBOARD_DATA[1].address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white">
                2
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">{LEADERBOARD_DATA[1].address}</p>
            <p className="text-xs text-muted-foreground">{LEADERBOARD_DATA[1].xp.toLocaleString()} XP</p>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <Avatar className="h-20 w-20 border-2 border-yellow-500">
                <AvatarFallback className="bg-yellow-500/20 text-xl">
                  {LEADERBOARD_DATA[0].address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-bold text-black">
                1
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">{LEADERBOARD_DATA[0].address}</p>
            <p className="text-xs text-muted-foreground">{LEADERBOARD_DATA[0].xp.toLocaleString()} XP</p>
            <Badge className="mt-1 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
              {getLevelTitle(LEADERBOARD_DATA[0].level)}
            </Badge>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-amber-600">
                <AvatarFallback className="bg-secondary">
                  {LEADERBOARD_DATA[2].address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                3
              </div>
            </div>
            <p className="mt-3 text-sm font-medium">{LEADERBOARD_DATA[2].address}</p>
            <p className="text-xs text-muted-foreground">{LEADERBOARD_DATA[2].xp.toLocaleString()} XP</p>
          </div>
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
            <CardDescription>Complete leaderboard by XP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LEADERBOARD_DATA.map((user, index) => (
                <div
                  key={user.address}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    index < 3 ? "bg-secondary/50" : "hover:bg-secondary/30"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">{getRankIcon(index + 1)}</div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-sm">
                      {user.address.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.address}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Lvl {user.level}</span>
                      <span>•</span>
                      <span>{getLevelTitle(user.level)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{user.wins} wins</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="h-4 w-4" />
                      <span>{user.streak}</span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
