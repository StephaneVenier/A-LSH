import Link from "next/link";
import { formatTaskDueDate, formatTaskDueTime, taskPriorityLabels, type TaskRecord } from "@/lib/tasks/constants";

export function TaskPreview({ task, overdue }: { task: TaskRecord; overdue?: boolean }) {
  return <Link href={`/taches/${task.id}/modifier`} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] p-3 transition hover:border-[var(--mint)]">
    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${overdue ? "bg-[var(--coral)]" : "bg-[var(--green)]"}`} aria-hidden="true" />
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[var(--ink)]">{task.title}</span><span className="mt-1 block text-xs text-[var(--ink-soft)]">{task.due_date ? `${formatTaskDueDate(task.due_date)}${task.due_time ? ` à ${formatTaskDueTime(task.due_time)}` : ""}` : "Sans date"} · {taskPriorityLabels[task.priority]}</span></span>
    {overdue ? <span className="shrink-0 text-xs font-bold text-[var(--coral-dark)]">En retard</span> : null}
  </Link>;
}
