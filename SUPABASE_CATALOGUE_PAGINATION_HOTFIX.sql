-- Nebula Records v13 catalogue pagination hotfix
-- Expands Catalogue Preview Shelf slots from 6 to 12.
-- Homepage still renders only slots 01-06; catalogue and releases render 12 per page.

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

create index if not exists tracks_catalogue_preview_idx
on public.tracks(preview_enabled, preview_slot, created_at desc)
where preview_enabled = true;
