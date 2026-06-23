-- Run this in Supabase SQL Editor if you already installed an older Nebula schema.
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
