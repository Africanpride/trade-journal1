import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TradesList } from "@/components/dashboard/trades-list"
import type { Trade } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile for role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  // Fetch user's trades
  const { data: trades, error: tradesError } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const userTrades = (trades || []) as Trade[]

  // Calculate statistics
  const totalTrades = userTrades.length
  const openTrades = userTrades.filter((t) => t.status === "open").length
  const closedTrades = userTrades.filter((t) => t.status === "closed")
  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0).length
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userEmail={user.email || ""} userRole={profile?.role || "user"} />

      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Trade Journal</h1>
            <p className="text-muted-foreground">Track and analyze your trading performance</p>
          </div>

          <StatsCards totalTrades={totalTrades} openTrades={openTrades} totalPnL={totalPnL} winRate={winRate} />

          <div className="mt-8">
            <TradesList trades={userTrades} />
          </div>
        </div>
      </main>
    </div>
  )
}
