-- Cahier de travail: private notes for the current author only.

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  updated_by uuid not null references auth.users (id) on delete cascade,
  title text not null check (title = btrim(title) and char_length(title) between 1 and 200),
  content text not null default '',
  category text check (category is null or (category = btrim(category) and char_length(category) between 1 and 100)),
  occurred_at timestamptz,
  visibility text not null default 'private' check (visibility = 'private'),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_created_by_occurred_at_idx
  on public.notes (created_by, occurred_at desc nulls last);

create index if not exists notes_created_by_pinned_idx
  on public.notes (created_by, is_pinned, updated_at desc);

create index if not exists notes_workspace_idx
  on public.notes (workspace_id);

alter table public.notes
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'french'::regconfig,
      coalesce(title, '') || ' ' || coalesce(content, '')
    )
  ) stored;

create index if not exists notes_search_idx
  on public.notes using gin (search_vector);

-- The existing trigger keeps updated_at current; this one controls audit fields.
create or replace function public.set_note_audit_fields()
returns trigger
language plpgsql
set search_path = pg_catalog, public, auth
as $$
begin
  if tg_op = 'UPDATE' then
    if new.workspace_id is distinct from old.workspace_id
      or new.created_by is distinct from old.created_by then
      raise exception using
        errcode = '22023',
        message = 'A note cannot be moved or have its author changed';
    end if;
  end if;

  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists notes_set_audit_fields on public.notes;
create trigger notes_set_audit_fields
before insert or update on public.notes
for each row execute function public.set_note_audit_fields();

revoke all on function public.set_note_audit_fields() from public;
revoke all on table public.notes from public;
grant select, insert, update, delete on public.notes to authenticated;

alter table public.notes enable row level security;

drop policy if exists notes_select_own on public.notes;
create policy notes_select_own
on public.notes
for select
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists notes_insert_own on public.notes;
create policy notes_insert_own
on public.notes
for insert
to authenticated
with check (
  created_by = auth.uid()
  and updated_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists notes_update_own on public.notes;
create policy notes_update_own
on public.notes
for update
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
)
with check (
  created_by = auth.uid()
  and updated_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists notes_delete_own on public.notes;
create policy notes_delete_own
on public.notes
for delete
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);
