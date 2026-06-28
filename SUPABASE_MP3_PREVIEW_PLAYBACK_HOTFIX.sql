-- Nebula Records - MP3 Preview Playback Hotfix v15
-- Run this in Supabase SQL Editor for an existing project.
-- It wires uploaded MP3 files to the public Catalogue Preview Shelf and audio player.

alter table if exists public.tracks add column if not exists audio_path text;
alter table if exists public.tracks add column if not exists audio_bucket text default 'nebula-audio';
alter table if exists public.tracks add column if not exists audio_mime_type text;
alter table if exists public.tracks add column if not exists audio_size_bytes bigint;
alter table if exists public.tracks add column if not exists audio_uploaded_at timestamptz;
alter table if exists public.tracks add column if not exists preview_enabled boolean not null default false;
alter table if exists public.tracks add column if not exists preview_slot integer;
alter table if exists public.tracks add column if not exists is_full_song boolean not null default false;

do $$
declare
  constraint_name text;
begin
  select c.conname into constraint_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'tracks'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%preview_slot%'
  limit 1;

  if constraint_name is not null then
    execute format('alter table public.tracks drop constraint if exists %I', constraint_name);
  end if;
end $$;

alter table public.tracks
  add constraint tracks_preview_slot_check check (preview_slot is null or (preview_slot between 1 and 12));

create index if not exists tracks_audio_path_idx on public.tracks(audio_path) where audio_path is not null;
create index if not exists tracks_catalogue_preview_idx on public.tracks(preview_enabled, preview_slot, created_at desc) where preview_enabled = true;

-- Keep the public preview SELECT policy aligned with audio_url OR storage path playback.
drop policy if exists "tracks_public_select_catalogue_preview" on public.tracks;
create policy "tracks_public_select_catalogue_preview" on public.tracks
for select using (
  lower(status) = 'published'
  and preview_enabled = true
  and (nullif(audio_url, '') is not null or nullif(audio_path, '') is not null)
);

-- Make the preview bucket public so website visitors can stream selected preview MP3 files.
insert into storage.buckets (id, name, public)
values ('nebula-audio', 'nebula-audio', true)
on conflict (id) do update set public = true;

drop policy if exists "audio_authenticated_upload" on storage.objects;
drop policy if exists "audio_owner_or_admin_read" on storage.objects;
drop policy if exists "audio_public_read" on storage.objects;
drop policy if exists "audio_owner_or_admin_update" on storage.objects;
drop policy if exists "audio_owner_or_admin_delete" on storage.objects;

create policy "audio_authenticated_upload" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'nebula-audio'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create policy "audio_public_read" on storage.objects
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
