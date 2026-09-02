"use client";

import { useActionState } from "react";
import { createWorkspace } from "@/app/actions/workspaces";
import type { ActionState } from "@/app/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function WorkspaceForm() {
  const [state, formAction] = useActionState(createWorkspace, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="field-label">Nom de mon espace de travail</label>
        <input id="name" name="name" type="text" required maxLength={120} placeholder="Accueil de loisirs du Petit Chambord" className="field-input" />
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Vous pourrez inviter votre équipe ensuite.</p>
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <SubmitButton pendingLabel="Création de l’espace…">Créer mon espace</SubmitButton>
    </form>
  );
}
