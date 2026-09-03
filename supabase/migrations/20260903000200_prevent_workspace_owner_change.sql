-- Prevent changing the owner of an existing workspace.

create or replace function public.prevent_workspace_owner_change()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception using
      errcode = '22023',
      message = 'A workspace owner cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists workspaces_prevent_owner_change
on public.workspaces;

create trigger workspaces_prevent_owner_change
before update of created_by on public.workspaces
for each row
execute function public.prevent_workspace_owner_change();

revoke all on function public.prevent_workspace_owner_change()
from public;
