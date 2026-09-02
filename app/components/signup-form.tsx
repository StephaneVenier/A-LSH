"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type ActionState } from "@/app/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] p-5 text-sm leading-6 text-[var(--ink)]" role="status">
        <p className="font-semibold">Vérifiez votre boîte e-mail</p>
        <p className="mt-1">{state.success}</p>
        <Link href="/connexion" className="mt-4 inline-block font-semibold text-[var(--coral-dark)] underline-offset-4 hover:underline">Retour à la connexion</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="displayName" className="field-label">Prénom et nom</label>
        <input id="displayName" name="displayName" type="text" autoComplete="name" required minLength={2} maxLength={120} placeholder="Camille Martin" className="field-input" />
      </div>
      <div>
        <label htmlFor="email" className="field-label">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.fr" className="field-input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="field-input" />
        <p className="mt-2 text-xs text-[var(--muted)]">8 caractères minimum.</p>
      </div>
      <div>
        <label htmlFor="passwordConfirmation" className="field-label">Confirmer le mot de passe</label>
        <input id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" required minLength={8} className="field-input" />
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <SubmitButton pendingLabel="Création en cours…">Créer mon compte</SubmitButton>
      <p className="text-center text-sm text-[var(--muted)]">
        Vous avez déjà un compte ? <Link href="/connexion" className="font-semibold text-[var(--coral-dark)] underline-offset-4 hover:underline">Se connecter</Link>
      </p>
    </form>
  );
}
