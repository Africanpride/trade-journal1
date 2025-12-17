# TradeJournal

A professional trade journal app for tracking and analyzing your trading performance. Built with Next.js 16 and Supabase.

## Features

- **Automated Trade Logging**: Receive trades via API webhooks
- **Secure Authentication**: Email/password authentication with Supabase
- **Real-time Dashboard**: Track performance with statistics and trade history
- **Row Level Security**: Your data is protected with RLS policies
- **Professional UI**: Built with shadcn/ui components

## Getting Started

### 1. Set Up Database

Run the SQL script to create the necessary tables:

```bash
# The trades table will be automatically created from scripts/001_create_trades_table.sql
```

### 2. Sign Up

Navigate to `/auth/sign-up` and create an account. You'll need to verify your email before logging in.

### 3. Get Your API Token

After logging in, you'll need to get your access token for API requests. You can get this from your Supabase session or by implementing a token generation endpoint.

For development, you can get your token from the browser console after logging in:

```javascript
// In browser console after login
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log(data.session.access_token)
```

### 4. Send Trades via API

Send trades to the webhook endpoint:

**POST** `/api/trades`

Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Body:
```json
{
  "message": "BUY\nReasons: Bullish Engulfing, Support Bounce",
  "pair": "EURUSD",
  "timeframe": "PERIOD_H1",
  "direction": "BUY",
  "entry": 1.08520,
  "tp": 1.09020,
  "sl": 1.08020
}
```

### 5. View Your Dashboard

Navigate to `/dashboard` to see your trades, statistics, and performance metrics.

## API Endpoints

### Create Trade
- **POST** `/api/trades`
- Requires: `Authorization: Bearer <token>`
- Body: See example above

### Get All Trades
- **GET** `/api/trades`
- Requires: `Authorization: Bearer <token>`

### Update Trade
- **PATCH** `/api/trades/[id]`
- Requires: `Authorization: Bearer <token>`
- Body: `{ status, exit_price, pnl }`

### Delete Trade
- **DELETE** `/api/trades/[id]`
- Requires: `Authorization: Bearer <token>`

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

## Security

- Row Level Security (RLS) enabled on all tables
- User data is isolated and protected
- Authentication required for all API endpoints
- Secure password hashing with Supabase Auth

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment

Deploy to Vercel with one click from the v0 interface or via the Vercel CLI.
