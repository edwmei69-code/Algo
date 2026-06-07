-- ============================================================
-- ALGO — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  age         int check (age >= 13 and age <= 100),
  country     text,
  interests   text[] default '{}',
  is_premium  boolean default false,
  is_online   boolean default false,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─── MATCH QUEUE ────────────────────────────────────────────
create table if not exists match_queue (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade unique,
  interests   text[] default '{}',
  joined_at   timestamptz default now()
);

-- ─── ROOMS ──────────────────────────────────────────────────
create table if not exists rooms (
  id          uuid primary key default gen_random_uuid(),
  user1_id    uuid references profiles(id) on delete set null,
  user2_id    uuid references profiles(id) on delete set null,
  status      text default 'active' check (status in ('active', 'ended')),
  ended_by    uuid references profiles(id),
  created_at  timestamptz default now(),
  ended_at    timestamptz
);

-- ─── MESSAGES ───────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid references rooms(id) on delete cascade,
  sender_id   uuid references profiles(id) on delete set null,
  content     text not null check (char_length(content) <= 2000),
  created_at  timestamptz default now()
);

-- Index for fast room message lookups
create index if not exists messages_room_id_idx on messages(room_id, created_at);

-- ─── REPORTS ────────────────────────────────────────────────
create table if not exists reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references profiles(id) on delete cascade,
  reported_id  uuid references profiles(id) on delete cascade,
  room_id      uuid references rooms(id) on delete set null,
  reason       text not null,
  created_at   timestamptz default now()
);

-- ─── BLOCKS ─────────────────────────────────────────────────
create table if not exists blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid references profiles(id) on delete cascade,
  blocked_id  uuid references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(blocker_id, blocked_id)
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table profiles    enable row level security;
alter table match_queue enable row level security;
alter table rooms       enable row level security;
alter table messages    enable row level security;
alter table reports     enable row level security;
alter table blocks      enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Public profiles are viewable"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Match queue: users manage own entry
create policy "Users manage own queue entry"
  on match_queue for all using (auth.uid() = user_id);

-- Rooms: participants can read
create policy "Room participants can view"
  on rooms for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Authenticated users can create rooms"
  on rooms for insert with check (auth.role() = 'authenticated');

create policy "Participants can update room"
  on rooms for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages: room participants only
create policy "Room participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from rooms
      where rooms.id = messages.room_id
      and (rooms.user1_id = auth.uid() or rooms.user2_id = auth.uid())
    )
  );

create policy "Room participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from rooms
      where rooms.id = messages.room_id
      and (rooms.user1_id = auth.uid() or rooms.user2_id = auth.uid())
      and rooms.status = 'active'
    )
  );

-- Reports: authenticated users can file
create policy "Authenticated users can report"
  on reports for insert with check (auth.uid() = reporter_id);

-- Blocks: users manage own blocks
create policy "Users manage own blocks"
  on blocks for all using (auth.uid() = blocker_id);

create policy "Users can see who blocked them"
  on blocks for select using (auth.uid() = blocked_id);

-- ─── REALTIME ───────────────────────────────────────────────
-- Enable realtime for messages and rooms in Supabase dashboard:
-- Database > Replication > enable for: messages, rooms, match_queue

-- ─── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
