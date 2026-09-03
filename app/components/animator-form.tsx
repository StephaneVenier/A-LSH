"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createAnimator, type AnimatorActionState } from "@/app/actions/animators";
import { SubmitButton } from "./submit-button";

const initialState: AnimatorActionState = {};

export function AnimatorForm() {
  const [state, formAction] = useActionState(createAnimator, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="animator-name" className="field-label">Nom de l’animateur <span className="text-[var(--coral-dark)]" aria-hidden="true">*</span></label>
        <input id="animator-name" name="name" type="text" required maxLength={200} autoComplete="name" placeholder="Ex. Camille Martin" className="field-input" />
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Les noms déjà enregistrés seront proposés rapidement la prochaine fois.</p>
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/suivi-anims" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)]">Annuler</Link>
        <div className="sm:min-w-52"><SubmitButton pendingLabel="Enregistrement…">Créer la fiche</SubmitButton></div>
      </div>
    </form>
  );
}
