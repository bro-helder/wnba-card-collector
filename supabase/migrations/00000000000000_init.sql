-- Supabase Phase 1 schema for WNBA Card Collector

create extension if not exists "pgcrypto";

-- Create dedicated schema for WNBA Card Collector
create schema if not exists wnba_cards;

-- Profiles extend Supabase auth.users
create table if not exists wnba_cards.profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  email text,
  ebay_alert_email text,
  ebay_search_frequency text default 'daily',
  created_at timestamptz default now()
);

create table if not exists wnba_cards.sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  manufacturer text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists wnba_cards.parallels (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references wnba_cards.sets(id) on delete cascade,
  name text not null,
  short_code text,
  color_description text,
  finish_description text,
  print_run int,
  is_numbered boolean default false,
  is_base boolean default false,
  sort_order int default 0,
  notes text
);

create table if not exists wnba_cards.cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references wnba_cards.sets(id) on delete cascade,
  card_number text not null,
  player_name text not null,
  team text,
  rookie_card boolean default false,
  notes text,
  created_at timestamptz default now(),
  unique(set_id, card_number)
);

create table if not exists wnba_cards.collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references wnba_cards.cards(id),
  parallel_id uuid references wnba_cards.parallels(id),
  serial_number text,
  quantity int default 1,
  condition text,
  cost_paid numeric(8,2),
  acquisition_date date,
  notes text,
  scan_image_url text,
  created_at timestamptz default now()
);

-- Add check constraint for collection table
alter table wnba_cards.collection add constraint check_card_or_parallel 
  check (card_id is not null or parallel_id is not null);

create table if not exists wnba_cards.want_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references wnba_cards.cards(id),
  parallel_id uuid references wnba_cards.parallels(id),
  status text default 'wanted',
  max_price numeric(8,2),
  priority int default 3,
  source text,
  tracking_number text,
  notes text,
  ebay_alert_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists wnba_cards.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  goal_type text not null,
  set_id uuid references wnba_cards.sets(id),
  insert_name text,
  parallel_id uuid references wnba_cards.parallels(id),
  player_filter text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists wnba_cards.goal_cards (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references wnba_cards.goals(id) on delete cascade,
  card_id uuid references wnba_cards.cards(id),
  parallel_id uuid references wnba_cards.parallels(id)
);

-- Add unique constraint for goal_cards
alter table wnba_cards.goal_cards add constraint unique_goal_card 
  unique(goal_id, card_id, parallel_id);

create table if not exists wnba_cards.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  image_url text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists wnba_cards.scan_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references wnba_cards.scan_sessions(id) on delete cascade,
  rank int not null,
  card_id uuid references wnba_cards.cards(id),
  parallel_id uuid references wnba_cards.parallels(id),
  confidence numeric(4,3),
  serial_detected text,
  stage1_response jsonb,
  stage2_response jsonb,
  confirmed boolean default false,
  created_at timestamptz default now()
);

create table if not exists wnba_cards.ebay_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  want_list_id uuid references wnba_cards.want_list(id) on delete cascade,
  alert_type text default 'both',
  last_run_at timestamptz,
  last_result_count int,
  active boolean default true
);

create table if not exists wnba_cards.ebay_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  want_list_id uuid references wnba_cards.want_list(id),
  ebay_listing_id text,
  listing_title text,
  listing_price numeric(8,2),
  last_seen_price numeric(8,2),
  listing_url text,
  alert_type text,
  sent_at timestamptz default now(),
  last_checked_at timestamptz default now()
);

-- Add NOT NULL constraint for want_list_id
alter table wnba_cards.ebay_alerts 
  alter column want_list_id set not null;

create table if not exists wnba_cards.ebay_comps (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references wnba_cards.cards(id),
  parallel_id uuid references wnba_cards.parallels(id),
  ebay_item_id text unique,
  current_price numeric(8,2),
  listing_type text,
  listing_title text,
  listing_url text,
  fetched_at timestamptz default now()
);

-- Add check constraint for ebay_comps
alter table wnba_cards.ebay_comps add constraint check_comp_card_or_parallel 
  check (card_id is not null or parallel_id is not null);

-- Enable row level security for user-owned tables
alter table wnba_cards.profiles enable row level security;
alter table wnba_cards.collection enable row level security;
alter table wnba_cards.want_list enable row level security;
alter table wnba_cards.goals enable row level security;
alter table wnba_cards.goal_cards enable row level security;
alter table wnba_cards.scan_sessions enable row level security;
alter table wnba_cards.scan_results enable row level security;
alter table wnba_cards.ebay_searches enable row level security;
alter table wnba_cards.ebay_alerts enable row level security;

create policy "Users can manage their own profile" on wnba_cards.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "Users can manage their own collection" on wnba_cards.collection
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage their own want list" on wnba_cards.want_list
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage their own goals" on wnba_cards.goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage goal cards for their goals" on wnba_cards.goal_cards
  for all using (
    exists(select 1 from wnba_cards.goals where id = goal_id and user_id = auth.uid())
  ) with check (
    exists(select 1 from wnba_cards.goals where id = goal_id and user_id = auth.uid())
  );

create policy "Users can manage their own scan sessions" on wnba_cards.scan_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage scan results for their sessions" on wnba_cards.scan_results
  for all using (
    exists(select 1 from wnba_cards.scan_sessions where id = session_id and user_id = auth.uid())
  ) with check (
    exists(select 1 from wnba_cards.scan_sessions where id = session_id and user_id = auth.uid())
  );

create policy "Users can manage their own eBay searches" on wnba_cards.ebay_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage their own eBay alerts" on wnba_cards.ebay_alerts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Reference data is readable by any authenticated user.
alter table wnba_cards.sets enable row level security;
alter table wnba_cards.parallels enable row level security;
alter table wnba_cards.cards enable row level security;
alter table wnba_cards.ebay_comps enable row level security;

create policy "Authenticated users can read reference data" on wnba_cards.sets
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read reference data" on wnba_cards.parallels
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read reference data" on wnba_cards.cards
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can read eBay comp cache" on wnba_cards.ebay_comps
  for select using (auth.role() = 'authenticated');

create policy "Only service role can insert/update/delete comps" on wnba_cards.ebay_comps
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
