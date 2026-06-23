-- Nebula Records v6 artist catalogue hotfix
-- Run this in Supabase SQL Editor if your existing project was created before v6.

create table if not exists public.artist_catalogue (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  artist_name text not null,
  stage_name text,
  genre text default 'Open',
  bio text,
  status text not null default 'active' check (status in ('active','pipeline','paused','archived')),
  official_link text,
  image_url text,
  sort_order integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists artist_catalogue_status_sort_idx on public.artist_catalogue(status, sort_order);
alter table public.artist_catalogue enable row level security;

drop policy if exists "artist_catalogue_public_active" on public.artist_catalogue;
drop policy if exists "artist_catalogue_admin_all" on public.artist_catalogue;
drop policy if exists "artist_catalogue_artist_own_select" on public.artist_catalogue;

create policy "artist_catalogue_public_active" on public.artist_catalogue
for select using (status = 'active');
create policy "artist_catalogue_artist_own_select" on public.artist_catalogue
for select using (owner_id = auth.uid());
create policy "artist_catalogue_admin_all" on public.artist_catalogue
for all using (public.is_admin()) with check (public.is_admin());

insert into public.artist_catalogue (artist_name, stage_name, genre, bio, status, official_link, image_url, sort_order)
select 'Faturoti Moses', 'Blocboykiddie', 'Hip-Hop / Afro-fusion / Melodic Trap', 'First official Nebula Records artist and opening catalogue mirror.', 'active', 'https://songwhip.com/blocboykiddie', 'assets/artist-blocboykiddie.svg', 1
where not exists (select 1 from public.artist_catalogue where lower(stage_name) = 'blocboykiddie');
