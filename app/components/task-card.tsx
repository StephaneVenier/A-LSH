import Link from "next/link";
import { toggleTaskPinned, toggleTaskStatus } from "@/app/actions/tasks";
import { formatTaskDueDate, formatTaskDueTime, taskPriorityLabels, taskStatusLabels, type TaskRecord } from "@/lib/tasks/constants";
import { DeleteTaskForm } from "./delete-task-form";

export function TaskCard({ task, todayIso }: { task: TaskRecord; todayIso: string }) {
  const overdue = task.status !== "done" && Boolean(task.due_date && task.due_date < todayIso);
  return (
    <article className={`rounded-3xl border bg-white p-4 shadow-[0_10px_30px_rgba(31,65,54,0.05)] ${task.is_pinned ? "border-[var(--coral)]" : "border-[var(--line)]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`break-words text-base font-bold text-[var(--ink)] ${task.status === "done" ? "line-through opacity-70" : ""}`}>{task.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--ink-soft)]">
            <span>{task.category ?? "Général"}</span><span aria-hidden="true">·</span><span>{taskPriorityLabels[task.priority]}</span><span aria-hidden="true">·</span><span>{taskStatusLabels[task.status]}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs text-[var(--ink-soft)]" aria-label="Propriétés de la tâche">
          <span title="Tâche privée" aria-label="Privée">🔒</span>{task.is_pinned ? <span title="Tâche épinglée" aria-label="Épinglée">★</span> : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
        {task.due_date ? <span>{formatTaskDueDate(task.due_date)}{task.due_time ? ` à ${formatTaskDueTime(task.due_time)}` : " · toute la journée"}</span> : <span>Sans date</span>}
        {overdue ? <span className="rounded-full bg-[#fff0eb] px-2.5 py-1 text-xs font-bold text-[var(--coral-dark)]">En retard</span> : null}
      </div>
      {task.description ? <details className="mt-3 border-t border-[var(--line)] pt-3 text-sm leading-6 text-[var(--ink-soft)]"><summary className="cursor-pointer font-semibold text-[var(--ink)]">Afficher la description</summary><p className="mt-2 whitespace-pre-wrap">{task.description}</p></details> : null}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
        <form action={toggleTaskStatus}><input type="hidden" name="id" value={task.id} /><button type="submit" className="touch-target rounded-xl bg-[var(--mint-pale)] px-3 text-xs font-bold text-[var(--green)]">{task.status === "done" ? "Rouvrir" : "Terminer"}</button></form>
        <form action={toggleTaskPinned}><input type="hidden" name="id" value={task.id} /><button type="submit" className="touch-target rounded-xl border border-[var(--line)] px-3 text-xs font-bold text-[var(--ink)]">{task.is_pinned ? "Désépingler" : "Épingler"}</button></form>
        <Link href={`/taches/${task.id}/modifier`} className="touch-target rounded-xl border border-[var(--line)] px-3 text-xs font-bold text-[var(--ink)]">Modifier</Link>
        <DeleteTaskForm id={task.id} />
      </div>
    </article>
  );
}
