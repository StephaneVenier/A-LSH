"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createTask, updateTask, type TaskActionState } from "@/app/actions/tasks";
import { taskCategories, taskPriorities, taskPriorityLabels, taskStatuses, taskStatusLabels, type TaskRecord } from "@/lib/tasks/constants";
import { SubmitButton } from "./submit-button";

const initialState: TaskActionState = {};

export function TaskForm({ task }: { task?: TaskRecord }) {
  const [state, formAction] = useActionState(task ? updateTask : createTask, initialState);
  const [hasDate, setHasDate] = useState(Boolean(task?.due_date));

  return (
    <form action={formAction} className="space-y-6">
      {task ? <input type="hidden" name="id" value={task.id} /> : null}
      <div>
        <label htmlFor="task-title" className="field-label">Titre <span className="text-[var(--coral-dark)]" aria-hidden="true">*</span></label>
        <input id="task-title" name="title" type="text" required maxLength={200} defaultValue={task?.title} placeholder="Ex. Préparer la réunion d’équipe" className="field-input" />
      </div>
      <div>
        <label htmlFor="task-description" className="field-label">Description</label>
        <textarea id="task-description" name="description" rows={6} maxLength={100000} defaultValue={task?.description ?? ""} placeholder="Ajoutez les éléments utiles…" className="field-input min-h-36 resize-y" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="field-label">Catégorie</label>
          <select id="task-category" name="category" defaultValue={task?.category ?? "Général"} className="field-input">
            {taskCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-priority" className="field-label">Priorité</label>
          <select id="task-priority" name="priority" defaultValue={task?.priority ?? "normal"} className="field-input">
            {taskPriorities.map((priority) => <option key={priority} value={priority}>{taskPriorityLabels[priority]}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="task-status" className="field-label">Statut{task ? "" : " initial"}</label>
          {task ? <select id="task-status" name="status" defaultValue={task.status} className="field-input">{taskStatuses.map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}</select> : <><input type="hidden" name="status" value="todo" /><div id="task-status" className="field-input flex items-center bg-[var(--background)] text-[var(--ink-soft)]">À faire</div></>}
        </div>
        <div>
          <label htmlFor="task-due-date" className="field-label">Date d’échéance</label>
          <input id="task-due-date" name="dueDate" type="date" defaultValue={task?.due_date ?? ""} onChange={(event) => setHasDate(Boolean(event.target.value))} className="field-input" />
        </div>
      </div>
      <div>
        <label htmlFor="task-due-time" className="field-label">Heure d’échéance <span className="font-normal text-[var(--ink-soft)]">(facultative)</span></label>
        <input id="task-due-time" name="dueTime" type="time" defaultValue={task?.due_time?.slice(0, 5) ?? ""} disabled={!hasDate} className="field-input sm:max-w-xs" />
        <p className="field-help">Une heure ne peut être choisie qu’avec une date.</p>
      </div>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">
        <input type="checkbox" name="isPinned" defaultChecked={task?.is_pinned} className="h-5 w-5 accent-[var(--coral)]" />
        <span>Épingler cette tâche</span>
      </label>
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] px-4 py-3 text-sm leading-5 text-[var(--ink-soft)]"><span aria-hidden="true">🔒</span><p><strong>Cette tâche est privée.</strong><br />Elle est visible uniquement par vous.</p></div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/taches" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--background)]">Annuler</Link>
        <div className="sm:min-w-44"><SubmitButton pendingLabel={task ? "Enregistrement…" : "Création…"}>{task ? "Enregistrer" : "Créer la tâche"}</SubmitButton></div>
      </div>
    </form>
  );
}
