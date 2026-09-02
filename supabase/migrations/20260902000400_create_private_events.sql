-- Evenements prives, avec dates et heures separees pour l'Agenda.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  updated_by uuid not null references auth.users (id) on delete cascade,
  title text not null check (title = btrim(title) and char_length(title) between 1 and 200),
  description text not null default '',
  location text not null default '',
  category text check (
    category is null
    or (category = btrim(category) and char_length(category) between 1 and 100)
  ),
  color text not null default 'green' check (color in ('green', 'coral', 'blue', 'violet', 'amber', 'gray')),
  start_date date not null,
  start_time time,
  end_date date not null,
  end_time time,
  is_all_day boolean not null default false,
  visibility text not null default 'private' check (visibility = 'private'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (
    (is_all_day and start_time is null and end_time is null)
    or (not is_all_day and start_time is not null and end_time is not null)
  ),
  check (
    start_date <> end_date
    or is_all_day
    or end_time > start_time
  )
);

create index if not exists events_created_by_dates_idx
  on public.events (created_by, start_date, end_date);

create index if not exists events_workspace_dates_idx
  on public.events (workspace_id, start_date, end_date);

create index if not exists events_created_by_category_idx
  on public.events (created_by, category);

alter table public.events
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'french'::regconfig,
      coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(location, '')
    )
  ) stored;

create index if not exists events_search_idx
  on public.events using gin (search_vector);

create or replace function public.set_event_audit_fields()
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
        message = 'An event cannot be moved or have its author changed';
    end if;
  end if;

  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists events_set_audit_fields on public.events;
create trigger events_set_audit_fields
before insert or update on public.events
for each row execute function public.set_event_audit_fields();

revoke all on function public.set_event_audit_fields() from public;
revoke all on table public.events from public;
grant select, insert, update, delete on public.events to authenticated;

alter table public.events enable row level security;

drop policy if exists events_select_own on public.events;
create policy events_select_own
on public.events
for select
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists events_insert_own on public.events;
create policy events_insert_own
on public.events
for insert
to authenticated
with check (
  created_by = auth.uid()
  and updated_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists events_update_own on public.events;
create policy events_update_own
on public.events
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

drop policy if exists events_delete_own on public.events;
create policy events_delete_own
on public.events
for delete
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);
