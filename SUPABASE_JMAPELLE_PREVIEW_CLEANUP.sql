-- Nebula Records: optional Jmapelle_Hushpuppi preview cleanup
-- Run this only if a broken/private/expired audio_url is overriding the bundled fallback.
-- After running it, the website will use its local fallback until you upload a new public Supabase MP3.

update public.tracks
set
  title = 'Jmapelle_Hushpuppi',
  artist = 'Blocboykiddie',
  type = coalesce(nullif(type, ''), 'Single'),
  status = 'Published',
  track_key = 'jmapelle-hushpuppi',
  link = coalesce(nullif(link, ''), 'https://songwhip.com/blocboykiddie'),
  audio_url = null,
  updated_at = now()
where lower(regexp_replace(coalesce(track_key, title, ''), '[^a-z0-9]', '', 'g')) in (
  'jmapellehushpuppi',
  'jmapellehushpupi'
);
