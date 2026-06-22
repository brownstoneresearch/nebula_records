-- Nebula Records Supabase hotfix - editable preview track library v4.2
-- Run this once in Supabase SQL Editor if your project was created with an older schema.

alter table if exists public.tracks add column if not exists track_key text;
alter table if exists public.tracks add column if not exists cover_url text;

create index if not exists tracks_track_key_idx on public.tracks(track_key);
create unique index if not exists tracks_owner_track_key_unique
  on public.tracks(owner_id, track_key)
  where track_key is not null;

-- Confirm policies allow signed artists to update their own tracks and admin to update all tracks.
drop policy if exists "tracks_update_own_or_admin" on public.tracks;
create policy "tracks_update_own_or_admin" on public.tracks
for update using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

-- Confirm storage read/upload/update policies for preview MP3 replacement.
insert into storage.buckets (id, name, public)
values ('nebula-audio', 'nebula-audio', true)
on conflict (id) do update set public = true;

-- Run the full supabase-schema.sql for the complete hardened setup if any table/policy is missing.
