-- Enforce one owned workspace per user without restricting memberships.

do $$
begin
  if exists (
    select 1
    from public.workspaces
    group by created_by
    having count(*) > 1
  ) then
    raise exception using
      errcode = '23505',
      message = 'Duplicate workspace owners must be resolved before adding the unique index';
  end if;
end;
$$;

create unique index if not exists workspaces_one_owned_workspace_idx
  on public.workspaces (created_by);

create or replace function public.create_workspace(workspace_name text)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  new_workspace_id uuid;
begin
  if current_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'Authentication required';
  end if;

  if workspace_name is null
     or char_length(btrim(workspace_name)) not between 1 and 120 then
    raise exception using
      errcode = '22023',
      message = 'Workspace name must contain 1 to 120 characters';
  end if;

  insert into public.workspaces (name, created_by)
  values (btrim(workspace_name), current_user_id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, current_user_id, 'admin'::public.workspace_role);

  return new_workspace_id;
exception
  when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'User already owns a workspace';
end;
$$;

revoke all on function public.create_workspace(text) from public;
grant execute on function public.create_workspace(text) to authenticated;
