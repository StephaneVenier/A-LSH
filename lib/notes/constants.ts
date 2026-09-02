export const noteCategories = [
  "Général",
  "Information importante",
  "Appel / échange",
  "Réunion",
  "Idée",
  "À retenir",
] as const;

export type NoteCategory = (typeof noteCategories)[number];

export type NoteRecord = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  occurred_at: string | null;
  visibility: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export function isNoteCategory(value: string): value is NoteCategory {
  return noteCategories.includes(value as NoteCategory);
}

export function formatNoteDate(value: string | null) {
  if (!value) return "Date non renseignée";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
