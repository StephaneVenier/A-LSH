-- Classification only: ownership, visibility and content remain unchanged.
begin;

alter table public.notes
  add column section text not null default 'notebook'
  constraint notes_section_check
  check (section in ('notebook', 'training', 'project'));

create index notes_workspace_author_section_date_idx
  on public.notes (workspace_id, created_by, section, occurred_at desc nulls last);

commit;
