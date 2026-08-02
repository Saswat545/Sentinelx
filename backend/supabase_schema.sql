-- Run this once in Supabase: SQL Editor -> New query -> Run.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_input text not null,
  label text not null,
  risk_score integer not null check (risk_score between 0 and 100),
  verdict text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists scan_history_user_created_idx on public.scan_history(user_id, created_at desc);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  primary key (team_id, user_id)
);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.scan_history enable row level security;
alter table public.api_keys enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

create policy "profiles own record" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "scan history own records" on public.scan_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "api keys own records" on public.api_keys for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "team owners manage teams" on public.teams for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "team members view membership" on public.team_members for select using (auth.uid() = user_id);
