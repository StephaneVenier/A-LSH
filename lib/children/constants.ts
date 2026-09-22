export type ChildRecord = {
  id: string;
  workspace_id: string;
  name: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ChildNoteRecord = {
  id: string;
  child_id: string;
  content: string;
  created_by: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export function formatChildNoteDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}
