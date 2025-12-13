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
  screenshot_url?: string
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

export interface ApiKey {
  id: string
  user_id: string
  key: string
  label: string
  created_at: string
}
