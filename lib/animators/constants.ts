export type AnimatorRecord = {
  id: string;
  workspace_id: string;
  name: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AnimatorNoteRecord = {
  id: string;
  animator_id: string;
  content: string;
  created_by: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export function formatAnimatorNoteDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}
