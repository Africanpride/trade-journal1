export interface Trade {
  id: string
  user_id: string
  pair: string
  timeframe: string
  direction: "BUY" | "SELL"
  entry: number
  tp?: number
  sl?: number
  reasons?: string
  status: "open" | "closed" | "cancelled"
  exit_price?: number
  pnl?: number
  created_at: string
  closed_at?: string
}

export interface TradeWebhookPayload {
  message: string
  pair: string
  timeframe: string
  direction: "BUY" | "SELL"
  entry: number
  tp?: number
  sl?: number
}
