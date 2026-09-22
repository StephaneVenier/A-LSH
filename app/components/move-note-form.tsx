"use client";

import { useActionState, useId } from "react";
import { moveNote } from "@/app/actions/notes";
import { noteSections, sectionInfo, type NoteSection } from "@/lib/notes/sections";

export function MoveNoteForm({ id, section }: { id: string; section: NoteSection }) {
  const [state, action, pending] = useActionState(moveNote, {});
  const selectId = useId();
  return (
    <details className="mt-3 border-t border-[var(--line)] pt-3">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-[var(--ink)]">Déplacer vers…</summary>
      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <label htmlFor={selectId} className="field-label">Rubrique de destination</label>
        <select id={selectId} name="destination" required disabled={pending} className="field-input">
          {noteSections.filter((value) => value !== section).map((value) =>
            <option key={value} value={value}>{sectionInfo[value].label}</option>
          )}
        </select>
        <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-white hover:bg-[var(--ink-soft)] disabled:opacity-60">
          {pending ? "Déplacement…" : "Déplacer"}
        </button>
        {state.error ? <p role="alert" className="form-error">{state.error}</p> : null}
      </form>
    </details>
  );
}
