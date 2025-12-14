-- Create profiles table
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  telephone text,
  country text,
  role text not null default 'user' check (role in ('user', 'admin', 'superadmin')),
  banned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policies
-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = user_id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

-- Users can update their own profile (but not role or banned_at)
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and role = (select role from profiles where user_id = auth.uid())
    and banned_at is not distinct from (select banned_at from profiles where user_id = auth.uid())
  );

-- Superadmins can read all profiles
create policy "Superadmins can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'superadmin'
    )
  );

-- Superadmins can update any profile
create policy "Superadmins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'superadmin'
    )
  );

-- Superadmins can delete any profile
create policy "Superadmins can delete any profile"
  on profiles for delete
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'superadmin'
    )
  );

-- Indexes for performance
create index idx_profiles_role on profiles(role);
create index idx_profiles_banned on profiles(banned_at);

-- Trigger to update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

-- Enable realtime (optional)
alter publication supabase_realtime add table profiles;
