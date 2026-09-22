"use client";

import { useActionState } from "react";
import { createChildNote, type ChildActionState } from "@/app/actions/children";
import { SubmitButton } from "./submit-button";

const initialState: ChildActionState = {};

export function ChildNoteForm({ childId }: { childId: string }) {
  const [state, formAction] = useActionState(createChildNote, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="childId" value={childId} />
      <div>
        <label htmlFor="child-note-content" className="field-label">Votre note <span className="text-[var(--coral-dark)]" aria-hidden="true">*</span></label>
        <textarea id="child-note-content" name="content" required maxLength={100000} rows={6} placeholder="Ajoutez une observation…" className="field-input min-h-36 resize-y" />
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] px-4 py-3 text-sm leading-5 text-[var(--ink-soft)]"><span aria-hidden="true">🔒</span><p><strong>Cette note est privée.</strong><br />Elle est visible uniquement par vous.</p></div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="sm:max-w-52"><SubmitButton pendingLabel="Ajout…">Ajouter la note</SubmitButton></div>
    </form>
  );
}
