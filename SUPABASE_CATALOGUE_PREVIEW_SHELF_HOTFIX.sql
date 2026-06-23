-- Nebula Records v9 Catalogue Preview Shelf hotfix
-- Run this in Supabase SQL Editor for existing projects.

alter table if exists public.tracks add column if not exists preview_enabled boolean not null default false;
alter table if exists public.tracks add column if not exists preview_slot integer check (preview_slot between 1 and 12);
alter table if exists public.tracks add column if not exists is_full_song boolean not null default false;

create index if not exists tracks_catalogue_preview_idx
on public.tracks(preview_enabled, preview_slot, created_at desc)
where preview_enabled = true;

drop policy if exists "tracks_public_select_published" on public.tracks;
drop policy if exists "tracks_public_select_catalogue_preview" on public.tracks;
create policy "tracks_public_select_catalogue_preview" on public.tracks
for select
using (lower(status) = 'published' and preview_enabled = true and audio_url is not null);

-- Storage stays public for preview playback, while upload/update/delete remain protected by existing authenticated policies.
insert into storage.buckets (id, name, public)
values ('nebula-audio', 'nebula-audio', true)
on conflict (id) do update set public = true;
