-- Nebula Records Supabase schema
-- Run this in Supabase SQL Editor after creating your project.
-- It creates secure role-based dashboards for admins and signed artists.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'artist' check (role in ('admin','artist')),
  artist_name text default 'Nebula Artist',
  status text not null default 'active' check (status in ('active','pending','suspended')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text not null,
  type text default 'Snippet',
  status text default 'Draft',
  link text,
  audio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  event_type text default 'play',
  track text,
  artist text,
  created_at timestamptz default now()
);

create table if not exists public.artists_pipeline (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  genre text default 'Open',
  status text default 'pipeline',
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.demo_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  link text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active')
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, artist_name, status)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'nebulamusic_rh@outlook.com' then 'admin' else 'artist' end,
    coalesce(new.raw_user_meta_data->>'artist_name', split_part(new.email, '@', 1)),
    'active'
  )
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.events enable row level security;
alter table public.artists_pipeline enable row level security;
alter table public.demo_leads enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);
create policy "profiles_update_own_or_admin" on public.profiles
for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

-- Tracks
create policy "tracks_select_own_or_admin" on public.tracks
for select using (owner_id = auth.uid() or public.is_admin());
create policy "tracks_insert_own_or_admin" on public.tracks
for insert with check (owner_id = auth.uid() or public.is_admin());
create policy "tracks_update_own_or_admin" on public.tracks
for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "tracks_delete_own_or_admin" on public.tracks
for delete using (owner_id = auth.uid() or public.is_admin());

-- Events
create policy "events_select_own_or_admin" on public.events
for select using (owner_id = auth.uid() or public.is_admin());
create policy "events_insert_authenticated" on public.events
for insert with check (auth.uid() is not null and (owner_id = auth.uid() or public.is_admin()));

-- Future artist pipeline: admin only.
create policy "pipeline_admin_all" on public.artists_pipeline
for all using (public.is_admin()) with check (public.is_admin());

-- Demo leads: public can submit, admin can read/update.
create policy "demo_public_insert" on public.demo_leads
for insert with check (true);
create policy "demo_admin_select" on public.demo_leads
for select using (public.is_admin());
create policy "demo_admin_update" on public.demo_leads
for update using (public.is_admin()) with check (public.is_admin());

-- Storage bucket setup.
-- The dashboard uploads files under a user-id folder: auth.uid()/filename.mp3
insert into storage.buckets (id, name, public)
values ('nebula-audio', 'nebula-audio', false)
on conflict (id) do nothing;

create policy "audio_authenticated_upload" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'nebula-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "audio_owner_or_admin_read" on storage.objects
for select to authenticated
using (
  bucket_id = 'nebula-audio'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create policy "audio_owner_or_admin_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'nebula-audio'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
)
with check (
  bucket_id = 'nebula-audio'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create policy "audio_owner_or_admin_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'nebula-audio'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
