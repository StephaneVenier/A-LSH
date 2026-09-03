-- Suivi anims: workspace-visible profiles with author-private notes.

create table if not exists public.animators (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 200),
  created_by uuid not null references auth.users (id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id)
);

create unique index if not exists animators_workspace_name_idx
  on public.animators (workspace_id, lower(btrim(name)));

create index if not exists animators_workspace_active_name_idx
  on public.animators (workspace_id, is_active, lower(name));

create table if not exists public.animator_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  animator_id uuid not null,
  content text not null check (char_length(btrim(content)) between 1 and 100000),
  created_by uuid not null references auth.users (id) on delete restrict,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, animator_id)
    references public.animators (workspace_id, id)
    on delete restrict
);

create index if not exists animator_notes_history_idx
  on public.animator_notes (workspace_id, animator_id, occurred_at desc);

create index if not exists animator_notes_author_idx
  on public.animator_notes (created_by, occurred_at desc);

create or replace function public.set_animator_audit_fields()
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
      message = 'Animator workspace and author cannot be changed';
  end if;

  return new;
end;
$$;

create or replace function public.set_animator_note_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  animator_workspace_id uuid;
  animator_is_active boolean;
begin
  if tg_op = 'INSERT' then
    if auth.uid() is null then
      raise exception using errcode = '42501', message = 'Authentication required';
    end if;

    select workspace_id
         , is_active
      into animator_workspace_id
         , animator_is_active
      from public.animators
     where id = new.animator_id;

    if animator_workspace_id is null then
      raise exception using errcode = '23503', message = 'Animator not found';
    end if;

    if not animator_is_active then
      raise exception using errcode = '22023', message = 'Archived animators cannot receive notes';
    end if;

    new.workspace_id = animator_workspace_id;
    new.created_by = auth.uid();
  elsif new.workspace_id is distinct from old.workspace_id
    or new.animator_id is distinct from old.animator_id
    or new.created_by is distinct from old.created_by then
    raise exception using
      errcode = '22023',
      message = 'Animator note ownership cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists animators_set_updated_at on public.animators;
create trigger animators_set_updated_at
before update on public.animators
for each row execute function public.set_updated_at();

drop trigger if exists animators_set_audit_fields on public.animators;
create trigger animators_set_audit_fields
before insert or update on public.animators
for each row execute function public.set_animator_audit_fields();

drop trigger if exists animator_notes_set_updated_at on public.animator_notes;
create trigger animator_notes_set_updated_at
before update on public.animator_notes
for each row execute function public.set_updated_at();

drop trigger if exists animator_notes_set_audit_fields on public.animator_notes;
create trigger animator_notes_set_audit_fields
before insert or update on public.animator_notes
for each row execute function public.set_animator_note_audit_fields();

revoke all on function public.set_animator_audit_fields() from public;
revoke all on function public.set_animator_note_audit_fields() from public;
revoke all on table public.animators from public;
revoke all on table public.animator_notes from public;
grant select, insert, update on public.animators to authenticated;
grant select, insert, update, delete on public.animator_notes to authenticated;

alter table public.animators enable row level security;
alter table public.animator_notes enable row level security;

drop policy if exists animators_select_member on public.animators;
create policy animators_select_member
on public.animators
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists animators_insert_member on public.animators;
create policy animators_insert_member
on public.animators
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists animators_update_creator on public.animators;
create policy animators_update_creator
on public.animators
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

drop policy if exists animator_notes_select_own on public.animator_notes;
create policy animator_notes_select_own
on public.animator_notes
for select
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists animator_notes_insert_own on public.animator_notes;
create policy animator_notes_insert_own
on public.animator_notes
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);

drop policy if exists animator_notes_update_own on public.animator_notes;
create policy animator_notes_update_own
on public.animator_notes
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

drop policy if exists animator_notes_delete_own on public.animator_notes;
create policy animator_notes_delete_own
on public.animator_notes
for delete
to authenticated
using (
  created_by = auth.uid()
  and public.is_workspace_member(workspace_id)
);
