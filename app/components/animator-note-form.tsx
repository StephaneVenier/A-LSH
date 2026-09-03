"use client";

import { useActionState } from "react";
import { createAnimatorNote, type AnimatorActionState } from "@/app/actions/animators";
import { SubmitButton } from "./submit-button";

const initialState: AnimatorActionState = {};

export function AnimatorNoteForm({ animatorId }: { animatorId: string }) {
  const [state, formAction] = useActionState(createAnimatorNote, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="animatorId" value={animatorId} />
      <div>
        <label htmlFor="animator-note-content" className="field-label">Votre note <span className="text-[var(--coral-dark)]" aria-hidden="true">*</span></label>
        <textarea id="animator-note-content" name="content" required maxLength={100000} rows={6} placeholder="Ajoutez une observation professionnelle…" className="field-input min-h-36 resize-y" />
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] px-4 py-3 text-sm leading-5 text-[var(--ink-soft)]"><span aria-hidden="true">🔒</span><p><strong>Cette note est privée.</strong><br />Elle est visible uniquement par vous.</p></div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="sm:max-w-52"><SubmitButton pendingLabel="Ajout…">Ajouter la note</SubmitButton></div>
    </form>
  );
}
