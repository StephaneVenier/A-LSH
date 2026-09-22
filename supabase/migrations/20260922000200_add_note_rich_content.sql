begin;

-- No backfill: legacy notes retain their exact plain-text content.
alter table public.notes
  add column if not exists content_json jsonb,
  add column if not exists content_version smallint not null default 1;

alter table public.notes drop constraint if exists notes_content_version_check;
alter table public.notes add constraint notes_content_version_check
  check (content_version = 1);

alter table public.notes drop constraint if exists notes_content_json_check;
alter table public.notes add constraint notes_content_json_check
  check (content_json is null or (
    jsonb_typeof(content_json) = 'object'
    and content_json @> '{"type":"doc"}'::jsonb
    and octet_length(content_json::text) <= 1024000
  ));

comment on column public.notes.content_json is
  'Versioned rich document. Strictly validate before editing/rendering; never render arbitrary HTML.';
comment on column public.notes.content_version is
  'Rich document schema version. V1 only. NULL content_json means legacy plain text.';

-- Existing author-only RLS, audit triggers and generated search_vector are unchanged.
-- Server Actions derive content from the validated JSON in the same INSERT/UPDATE.
-- The database byte limit accommodates jsonb whitespace; the app caps compact JSON at 512000 bytes.
commit;
