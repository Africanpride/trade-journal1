-- Create trades table for trade journaling
create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Trade details
  pair text not null,
  timeframe text not null,
  direction text not null check (direction in ('BUY', 'SELL')),
  entry numeric not null,
  tp numeric,
  sl numeric,
  
  -- Trade metadata
  reasons text,
  screenshot_url text,
  status text not null default 'open' check (status in ('open', 'closed', 'cancelled')),
  
  -- Outcome (filled when trade closes)
  exit_price numeric,
  profit_loss numeric,
  closed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table trades enable row level security;

-- RLS Policies
-- Users can read their own trades
create policy "Users can read own trades"
  on trades for select
  using (auth.uid() = user_id);

-- Users can insert their own trades
create policy "Users can insert own trades"
  on trades for insert
  with check (auth.uid() = user_id);

-- Users can update their own trades
create policy "Users can update own trades"
  on trades for update
  using (auth.uid() = user_id);

-- Users can delete their own trades
create policy "Users can delete own trades"
  on trades for delete
  using (auth.uid() = user_id);

-- Superadmins can read all trades (for analytics)
create policy "Superadmins can read all trades"
  on trades for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'superadmin'
    )
  );

-- Indexes for performance
create index idx_trades_user_id on trades(user_id);
create index idx_trades_status on trades(status);
create index idx_trades_created_at on trades(created_at desc);
create index idx_trades_pair on trades(pair);

-- Trigger to update updated_at
create trigger trades_updated_at
  before update on trades
  for each row
  execute function update_updated_at();

-- Enable realtime (optional)
alter publication supabase_realtime add table trades;
