"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Trade } from "@/lib/types"
import { ArrowUp, ArrowDown, Pencil } from "lucide-react"
import { EditTradeDialog } from "./edit-trade-dialog"

interface TradesListProps {
  trades: Trade[]
}

export function TradesList({ trades }: TradesListProps) {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "closed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "cancelled":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>A complete history of your trading activity</CardDescription>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No trades yet. Start by sending a trade via webhook API.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <div key={trade.id} className="flex items-start gap-4 rounded-lg border p-4 group">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${trade.direction === "BUY" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                  >
                    {trade.direction === "BUY" ? (
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{trade.pair}</h3>
                        <Badge variant="outline" className={getStatusColor(trade.status)}>
                          {trade.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-medium">{trade.timeframe}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingTrade(trade)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground">Entry: </span>
                        <span className="font-medium">{trade.entry}</span>
                      </div>
                      {trade.tp && (
                        <div>
                          <span className="text-muted-foreground">TP: </span>
                          <span className="font-medium">{trade.tp}</span>
                        </div>
                      )}
                      {trade.sl && (
                        <div>
                          <span className="text-muted-foreground">SL: </span>
                          <span className="font-medium">{trade.sl}</span>
                        </div>
                      )}
                      {trade.pnl !== null && trade.pnl !== undefined && (
                        <div>
                          <span className="text-muted-foreground">P&L: </span>
                          <span className={`font-medium ${trade.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {trade.pnl >= 0 ? "+" : ""}
                            {trade.pnl.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {trade.reasons && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Reasons:</span> {trade.reasons}
                      </p>
                    )}

                    {trade.screenshot_url && (
                      <div className="mt-2">
                        <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline flex items-center gap-1">
                          View Screenshot <ArrowUp className="w-3 h-3 rotate-45" />
                        </a>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">{formatDate(trade.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingTrade && (
        <EditTradeDialog
          trade={editingTrade}
          open={!!editingTrade}
          onOpenChange={(open) => !open && setEditingTrade(null)}
        />
      )}
    </>
  )
}
