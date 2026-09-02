export const taskCategories = [
  "Général",
  "Administration",
  "Équipe",
  "Matériel",
  "Familles",
  "Projet",
  "À rappeler",
] as const;

export const taskPriorities = ["low", "normal", "high", "urgent"] as const;
export const taskStatuses = ["todo", "in_progress", "done"] as const;

export type TaskCategory = (typeof taskCategories)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskStatus = (typeof taskStatuses)[number];

export type TaskRecord = {
  id: string;
  workspace_id: string;
  created_by: string;
  updated_by: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  due_time: string | null;
  completed_at: string | null;
  visibility: "private";
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminée",
};

export function isTaskCategory(value: string): value is TaskCategory {
  return taskCategories.includes(value as TaskCategory);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return taskPriorities.includes(value as TaskPriority);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return taskStatuses.includes(value as TaskStatus);
}

export function getTodayIso() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTaskDueDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

export function formatTaskDueTime(value: string) {
  return value.slice(0, 5);
}
