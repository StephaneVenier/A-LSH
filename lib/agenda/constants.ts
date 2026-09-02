export const agendaViews = ["mois", "semaine", "jour"] as const;
export type AgendaView = (typeof agendaViews)[number];

export const eventCategories = ["Général", "Réunion", "Absence", "Formation", "Sortie", "Échéance", "Personnel"] as const;
export const eventColors = ["green", "coral", "blue", "violet", "amber", "gray"] as const;
export type EventCategory = (typeof eventCategories)[number];
export type EventColor = (typeof eventColors)[number];

export type EventRecord = {
  id: string;
  workspace_id: string;
  created_by: string;
  updated_by: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  color: EventColor;
  start_date: string;
  start_time: string | null;
  end_date: string;
  end_time: string | null;
  is_all_day: boolean;
  visibility: "private";
  created_at: string;
  updated_at: string;
};

export type AgendaTask = {
  id: string;
  title: string;
  due_date: string;
  due_time: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "normal" | "high" | "urgent";
  is_pinned: boolean;
};

export const eventColorClasses: Record<EventColor, string> = {
  green: "border-l-[var(--green)] bg-[var(--mint-pale)] text-[var(--green)]",
  coral: "border-l-[var(--coral)] bg-[#fff0ed] text-[var(--coral-dark)]",
  blue: "border-l-[#4f83b5] bg-[#edf4fb] text-[#28577e]",
  violet: "border-l-[#8069a8] bg-[#f1edfa] text-[#5d477f]",
  amber: "border-l-[#c38a2e] bg-[#fff7df] text-[#7b5a17]",
  gray: "border-l-[#7b8982] bg-[#f0f2f0] text-[#53615a]",
};

export function isEventCategory(value: string): value is EventCategory { return eventCategories.includes(value as EventCategory); }
export function isEventColor(value: string): value is EventColor { return eventColors.includes(value as EventColor); }

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDays(value: string, amount: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

export function startOfWeek(value: string) {
  const date = parseDate(value);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return toIsoDate(date);
}

export function endOfWeek(value: string) { return addDays(startOfWeek(value), 6); }

export function monthRange(value: string) {
  const date = parseDate(value);
  const first = toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
  const last = toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  return { start: startOfWeek(first), end: endOfWeek(last) };
}

export function getAgendaRange(value: string, view: AgendaView) {
  if (view === "jour") return { start: value, end: value };
  if (view === "semaine") return { start: startOfWeek(value), end: endOfWeek(value) };
  return monthRange(value);
}

export function listDates(start: string, end: string) {
  const dates: string[] = [];
  for (let current = start; current <= end; current = addDays(current, 1)) dates.push(current);
  return dates;
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("fr-FR", options).format(parseDate(value));
}

export function formatMonth(value: string) { return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(parseDate(value)); }
export function formatTime(value: string | null) { return value ? value.slice(0, 5) : ""; }
export function isToday(value: string) { return value === toIsoDate(new Date()); }
