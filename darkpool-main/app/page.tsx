"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { MarketCard } from "@/components/market/market-card"
import { useMarkets } from "@/hooks/use-markets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, PHASE } from "@/lib/constants"
import { Search, Filter, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "all" | "active" | "reveal" | "resolved"

export default function HomePage() {
  const { markets, isLoading } = useMarkets()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  // Filter markets
  const filteredMarkets = markets.filter((market) => {
    // Search filter
    if (search && !market.question.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    // Category filter
    if (selectedCategory && market.category !== selectedCategory) {
      return false
    }

    // Phase filter
    if (filter === "active" && market.phase !== PHASE.COMMIT) return false
    if (filter === "reveal" && market.phase !== PHASE.REVEAL) return false
    if (filter === "resolved" && market.phase < PHASE.RESOLVED) return false

    return true
  })

  const phaseFilters: { id: FilterType; label: string; icon: typeof TrendingUp }[] = [
    { id: "all", label: "All Markets", icon: Filter },
    { id: "active", label: "Commit Phase", icon: Clock },
    { id: "reveal", label: "Reveal Phase", icon: TrendingUp },
    { id: "resolved", label: "Resolved", icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Hidden Predictions, <span className="text-primary">Revealed Outcomes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            The first darkpool prediction market on Aptos. Your predictions remain encrypted until the reveal phase - no
            front-running, no bias.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>

          {/* Phase Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {phaseFilters.map((f) => {
              const Icon = f.icon
              return (
                <Badge
                  key={f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 transition-colors",
                    filter === f.id && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => setFilter(f.id)}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {f.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Markets Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No markets found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
