-- Taches privees, avec echeances compatibles avec une future vue Agenda.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  updated_by uuid not null references auth.users (id) on delete cascade,
  title text not null check (title = btrim(title) and char_length(title) between 1 and 200),
  description text not null default '',
  category text check (
    category is null
    or (category = btrim(category) and char_length(category) between 1 and 100)
  ),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  due_time time,
  completed_at timestamptz,
  visibility text not null default 'private' check (visibility = 'private'),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_time is null or due_date is not null),
  check ((status = 'done') = (completed_at is not null))
);

create index if not exists tasks_created_by_due_idx
  on public.tasks (created_by, due_date asc nulls last, due_time asc nulls last);

create index if not exists tasks_created_by_status_idx
  on public.tasks (created_by, status, due_date asc nulls last);

create index if not exists tasks_created_by_priority_idx
  on public.tasks (created_by, priority, due_date asc nulls last);

create index if not exists tasks_workspace_due_idx
  on public.tasks (workspace_id, due_date asc nulls last, due_time asc nulls last);

alter table public.tasks
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector(
      'french'::regconfig,
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) stored;

create index if not exists tasks_search_idx
  on public.tasks using gin (search_vector);

create or replace function public.set_task_audit_fields()
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
        message = 'A task cannot be moved or have its author changed';
    end if;
  end if;

  new.updated_by = auth.uid();
  return new;
end;
$$;

create or replace function public.sync_task_completed_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public, auth
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'done' then
      new.completed_at = now();
    else
      new.completed_at = null;
    end if;

    return new;
  end if;

  if new.status = 'done' then
    if old.status is distinct from 'done'
      or old.completed_at is null then
      new.completed_at = now();
    else
      new.completed_at = old.completed_at;
    end if;
  else
    new.completed_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_audit_fields on public.tasks;
create trigger tasks_set_audit_fields
before insert or update on public.tasks
for each row execute function public.set_task_audit_fields();

drop trigger if exists tasks_sync_completed_at on public.tasks;
create trigger tasks_sync_completed_at
before insert or update of status, completed_at on public.tasks
for each row execute function public.sync_task_completed_at();

revoke all on function public.set_task_audit_fields() from public;
revoke all on function public.sync_task_completed_at() from public;
revoke all on table public.tasks from public;
grant select, insert, update, delete on public.tasks to authenticated;

alter table public.tasks enable row level security;

drop policy if exists tasks_select_own on public.tasks;
create policy tasks_select_own
on public.tasks
for select
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists tasks_insert_own on public.tasks;
create policy tasks_insert_own
on public.tasks
for insert
to authenticated
with check (
  created_by = auth.uid()
  and updated_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);

drop policy if exists tasks_update_own on public.tasks;
create policy tasks_update_own
on public.tasks
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

drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_delete_own
on public.tasks
for delete
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
  and visibility = 'private'
);
