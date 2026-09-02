"use client";

import { deleteTask } from "@/app/actions/tasks";

export function DeleteTaskForm({ id }: { id: string }) {
  return (
    <form action={deleteTask} onSubmit={(event) => { if (!window.confirm("Supprimer définitivement cette tâche ? Cette action est irréversible.")) event.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="touch-target text-sm font-semibold text-[var(--coral-dark)] hover:underline">Supprimer</button>
    </form>
  );
}
