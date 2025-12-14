-- Create api_keys table for EA authentication
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null unique,
  label text default 'Default Key',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- One key per user (can be changed later if multiple keys needed)
  unique(user_id)
);

-- Enable RLS
alter table api_keys enable row level security;

-- RLS Policies
-- Users can read their own API keys
create policy "Users can read own api keys"
  on api_keys for select
  using (auth.uid() = user_id);

-- Users can insert their own API key
create policy "Users can insert own api key"
  on api_keys for insert
  with check (auth.uid() = user_id);

-- Users can update their own API key
create policy "Users can update own api key"
  on api_keys for update
  using (auth.uid() = user_id);

-- Users can delete their own API key
create policy "Users can delete own api key"
  on api_keys for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index idx_api_keys_user_id on api_keys(user_id);
create index idx_api_keys_key on api_keys(key);

-- Trigger to update updated_at
create trigger api_keys_updated_at
  before update on api_keys
  for each row
  execute function update_updated_at();
