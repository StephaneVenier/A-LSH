-- Suivi enfants: workspace-visible profiles with author-private notes.

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 200),
  created_by uuid not null references auth.users (id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id)
);

create unique index if not exists children_workspace_name_idx
  on public.children (workspace_id, lower(btrim(name)));

create index if not exists children_workspace_active_name_idx
  on public.children (workspace_id, is_active, lower(name));

create table if not exists public.child_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  child_id uuid not null,
  content text not null check (char_length(btrim(content)) between 1 and 100000),
  created_by uuid not null references auth.users (id) on delete restrict,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, child_id)
    references public.children (workspace_id, id)
    on delete restrict
);

create index if not exists child_notes_history_idx
  on public.child_notes (workspace_id, child_id, occurred_at desc);

create index if not exists child_notes_author_idx
  on public.child_notes (created_by, occurred_at desc);

create or replace function public.set_child_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is null then
      raise exception using errcode = '42501', message = 'Authentication required';
    end if;
    new.created_by = auth.uid();
  elsif new.workspace_id is distinct from old.workspace_id
    or new.created_by is distinct from old.created_by then
    raise exception using
      errcode = '22023',
      message = 'Child workspace and author cannot be changed';
  end if;

  return new;
end;
$$;

create or replace function public.set_child_note_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  child_workspace_id uuid;
  child_is_active boolean;
begin
  if tg_op = 'INSERT' then
    if auth.uid() is null then
      raise exception using errcode = '42501', message = 'Authentication required';
    end if;

    select workspace_id, is_active
      into child_workspace_id, child_is_active
      from public.children
     where id = new.child_id;

    if child_workspace_id is null then
      raise exception using errcode = '23503', message = 'Child not found';
    end if;

    if not child_is_active then
      raise exception using errcode = '22023', message = 'Archived children cannot receive notes';
    end if;

    new.workspace_id = child_workspace_id;
    new.created_by = auth.uid();
  elsif new.workspace_id is distinct from old.workspace_id
    or new.child_id is distinct from old.child_id
    or new.created_by is distinct from old.created_by then
    raise exception using
      errcode = '22023',
      message = 'Child note ownership cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists children_set_updated_at on public.children;
create trigger children_set_updated_at
before update on public.children
for each row execute function public.set_updated_at();

drop trigger if exists children_set_audit_fields on public.children;
create trigger children_set_audit_fields
before insert or update on public.children
for each row execute function public.set_child_audit_fields();

drop trigger if exists child_notes_set_updated_at on public.child_notes;
create trigger child_notes_set_updated_at
before update on public.child_notes
for each row execute function public.set_updated_at();

drop trigger if exists child_notes_set_audit_fields on public.child_notes;
create trigger child_notes_set_audit_fields
before insert or update on public.child_notes
for each row execute function public.set_child_note_audit_fields();

revoke all on function public.set_child_audit_fields() from public;
revoke all on function public.set_child_note_audit_fields() from public;
revoke all on table public.children from public;
revoke all on table public.child_notes from public;
grant select, insert, update on public.children to authenticated;
grant select, insert, update, delete on public.child_notes to authenticated;

alter table public.children enable row level security;
alter table public.child_notes enable row level security;

drop policy if exists children_select_member on public.children;
create policy children_select_member
on public.children
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists children_insert_member on public.children;
create policy children_insert_member
on public.children
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists children_update_creator on public.children;
create policy children_update_creator
on public.children
for update
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
)
with check (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists child_notes_select_own on public.child_notes;
create policy child_notes_select_own
on public.child_notes
for select
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists child_notes_insert_own on public.child_notes;
create policy child_notes_insert_own
on public.child_notes
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists child_notes_update_own on public.child_notes;
create policy child_notes_update_own
on public.child_notes
for update
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
)
with check (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists child_notes_delete_own on public.child_notes;
create policy child_notes_delete_own
on public.child_notes
for delete
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);
