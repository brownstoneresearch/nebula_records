-- Nebula Records Supabase schema - hardened v4.2 editable preview track library
-- Run this in Supabase SQL Editor after creating your project.
-- Supports admin and signed artist dashboards with role-based access.
-- Creates: profiles, tracks, events, artists_pipeline, demo_leads, ensure_profile(), hardened RLS policies, and nebula-audio storage.
-- v9 adds optional Catalogue Preview Shelf controls: preview_enabled, preview_slot and is_full_song.

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
  track_key text,
  cover_url text,
  preview_enabled boolean not null default false,
  preview_slot integer check (preview_slot between 1 and 6),
  is_full_song boolean not null default false,
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

-- Safe migrations for existing projects rerunning this schema.
alter table if exists public.tracks add column if not exists track_key text;
alter table if exists public.tracks add column if not exists cover_url text;
alter table if exists public.tracks add column if not exists preview_enabled boolean not null default false;
alter table if exists public.tracks add column if not exists preview_slot integer check (preview_slot between 1 and 6);
alter table if exists public.tracks add column if not exists is_full_song boolean not null default false;

create index if not exists tracks_owner_created_idx on public.tracks(owner_id, created_at desc);
create index if not exists tracks_track_key_idx on public.tracks(track_key);
create index if not exists tracks_catalogue_preview_idx on public.tracks(preview_enabled, preview_slot, created_at desc) where preview_enabled = true;
create unique index if not exists tracks_owner_track_key_unique on public.tracks(owner_id, track_key) where track_key is not null;
create index if not exists events_owner_created_idx on public.events(owner_id, created_at desc);
create index if not exists demo_leads_created_idx on public.demo_leads(created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_tracks_updated_at on public.tracks;
create trigger touch_tracks_updated_at
  before update on public.tracks
  for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  )
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
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role,
    status = 'active',
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Secure helper called by login/dashboard. Role is derived from the authenticated user's email.
create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_email text;
  result public.profiles;
begin
  select email into current_email from auth.users where id = auth.uid();
  if current_email is null then
    raise exception 'No authenticated user found';
  end if;

  insert into public.profiles (id, email, role, artist_name, status)
  values (
    auth.uid(),
    current_email,
    case when lower(current_email) = 'nebulamusic_rh@outlook.com' then 'admin' else 'artist' end,
    split_part(current_email, '@', 1),
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role,
    status = 'active',
    updated_at = now()
  returning * into result;

  return result;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.events enable row level security;
alter table public.artists_pipeline enable row level security;
alter table public.demo_leads enable row level security;

-- Drop policies first so this file can be safely rerun.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_self_artist_only" on public.profiles;
drop policy if exists "profiles_update_self_artist_or_admin" on public.profiles;

drop policy if exists "tracks_select_own_or_admin" on public.tracks;
drop policy if exists "tracks_public_select_published" on public.tracks;
drop policy if exists "tracks_public_select_catalogue_preview" on public.tracks;
drop policy if exists "tracks_insert_own_or_admin" on public.tracks;
drop policy if exists "tracks_update_own_or_admin" on public.tracks;
drop policy if exists "tracks_delete_own_or_admin" on public.tracks;

drop policy if exists "events_select_own_or_admin" on public.events;
drop policy if exists "events_insert_authenticated" on public.events;

drop policy if exists "pipeline_admin_all" on public.artists_pipeline;
drop policy if exists "demo_public_insert" on public.demo_leads;
drop policy if exists "demo_admin_select" on public.demo_leads;
drop policy if exists "demo_admin_update" on public.demo_leads;

-- Profiles: users can read/update their own artist profile; admins can manage all.
create policy "profiles_select_own_or_admin" on public.profiles
for select using (auth.uid() = id or public.is_admin());
create policy "profiles_insert_self_artist_only" on public.profiles
for insert with check (auth.uid() = id and role = 'artist');
create policy "profiles_update_self_artist_or_admin" on public.profiles
for update using (auth.uid() = id or public.is_admin())
with check ((auth.uid() = id and role = 'artist') or public.is_admin());

-- Tracks
create policy "tracks_select_own_or_admin" on public.tracks
for select using (owner_id = auth.uid() or public.is_admin());
create policy "tracks_public_select_catalogue_preview" on public.tracks
for select using (lower(status) = 'published' and preview_enabled = true and audio_url is not null);
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

-- Demo leads: public can submit; only admin can read/update.
create policy "demo_public_insert" on public.demo_leads
for insert with check (true);
create policy "demo_admin_select" on public.demo_leads
for select using (public.is_admin());
create policy "demo_admin_update" on public.demo_leads
for update using (public.is_admin()) with check (public.is_admin());

-- Storage bucket setup. Public bucket allows preview snippets to be played by the website.
insert into storage.buckets (id, name, public)
values ('nebula-audio', 'nebula-audio', true)
on conflict (id) do update set public = true;

drop policy if exists "audio_authenticated_upload" on storage.objects;
drop policy if exists "audio_owner_or_admin_read" on storage.objects;
drop policy if exists "audio_owner_or_admin_update" on storage.objects;
drop policy if exists "audio_owner_or_admin_delete" on storage.objects;

create policy "audio_authenticated_upload" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'nebula-audio'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

create policy "audio_owner_or_admin_read" on storage.objects
for select using (bucket_id = 'nebula-audio');

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


-- V7 artist catalogue table for every signed Nebula Records artist.
create table if not exists public.signed_artists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  artist_name text not null,
  stage_name text not null,
  slug text unique not null,
  genre text default 'Next-generation artist',
  status text default 'signed' check (status in ('signed','development','inactive','pipeline')),
  headline text,
  bio text,
  image_url text,
  catalogue_url text,
  songwhip_url text,
  instagram_url text,
  x_url text,
  tiktok_url text,
  featured boolean default false,
  signed_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.signed_artists add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table if exists public.signed_artists add column if not exists artist_name text;
alter table if exists public.signed_artists add column if not exists stage_name text;
alter table if exists public.signed_artists add column if not exists slug text;
alter table if exists public.signed_artists add column if not exists genre text default 'Next-generation artist';
alter table if exists public.signed_artists add column if not exists status text default 'signed';
alter table if exists public.signed_artists add column if not exists headline text;
alter table if exists public.signed_artists add column if not exists bio text;
alter table if exists public.signed_artists add column if not exists image_url text;
alter table if exists public.signed_artists add column if not exists catalogue_url text;
alter table if exists public.signed_artists add column if not exists songwhip_url text;
alter table if exists public.signed_artists add column if not exists instagram_url text;
alter table if exists public.signed_artists add column if not exists x_url text;
alter table if exists public.signed_artists add column if not exists tiktok_url text;
alter table if exists public.signed_artists add column if not exists featured boolean default false;
alter table if exists public.signed_artists add column if not exists signed_order integer default 100;
alter table if exists public.signed_artists add column if not exists created_at timestamptz default now();
alter table if exists public.signed_artists add column if not exists updated_at timestamptz default now();

create unique index if not exists signed_artists_slug_unique on public.signed_artists(slug);
create index if not exists signed_artists_status_order_idx on public.signed_artists(status, signed_order);

alter table public.signed_artists enable row level security;

drop policy if exists "signed_artists_public_select_signed" on public.signed_artists;
drop policy if exists "signed_artists_admin_all" on public.signed_artists;
drop policy if exists "signed_artists_owner_select" on public.signed_artists;

create policy "signed_artists_public_select_signed" on public.signed_artists
for select using (status = 'signed');
create policy "signed_artists_owner_select" on public.signed_artists
for select using (owner_id = auth.uid() or public.is_admin());
create policy "signed_artists_admin_all" on public.signed_artists
for all using (public.is_admin()) with check (public.is_admin());

insert into public.signed_artists (
  artist_name, stage_name, slug, genre, status, headline, bio, image_url, catalogue_url, songwhip_url, featured, signed_order
) values (
  'Faturoti Moses',
  'Blocboykiddie',
  'blocboykiddie',
  'Hip-Hop / Afro-fusion / Melodic Trap',
  'signed',
  'First artist mirror under Nebula Records.',
  'Blocboykiddie is Nebula Records’ first signed artist, mirrored as the opening profile in a catalogue system built for every next-generation signing.',
  'assets/artist-blocboykiddie.svg',
  'catalogue.html',
  'https://songwhip.com/blocboykiddie',
  true,
  1
) on conflict (slug) do update set
  artist_name = excluded.artist_name,
  stage_name = excluded.stage_name,
  genre = excluded.genre,
  status = excluded.status,
  headline = excluded.headline,
  bio = excluded.bio,
  image_url = excluded.image_url,
  catalogue_url = excluded.catalogue_url,
  songwhip_url = excluded.songwhip_url,
  featured = excluded.featured,
  signed_order = excluded.signed_order,
  updated_at = now();
