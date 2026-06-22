-- Nebula Records Supabase RLS Upload Hotfix
-- Run this once in Supabase SQL Editor if you see:
-- "new row violates row-level security policy" while uploading snippets.
-- It fixes profile role sync and storage upload policies.

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

-- Promote the existing admin profile if it was created before the schema was fixed.
update public.profiles
set role = 'admin', status = 'active', updated_at = now()
where lower(email) = 'nebulamusic_rh@outlook.com';

-- Ensure preview bucket is public for playback.
insert into storage.buckets (id, name, public)
values ('nebula-audio', 'nebula-audio', true)
on conflict (id) do update set public = true;

-- Rebuild storage RLS policies for snippet uploads.
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

-- Allow public website to read published track metadata while dashboards remain protected.
drop policy if exists "tracks_public_select_published" on public.tracks;
create policy "tracks_public_select_published" on public.tracks
for select using (lower(status) = 'published');
