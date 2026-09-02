"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/actions/auth";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useActionState(signIn, {
    ...initialState,
    error: initialError,
  });

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="field-label">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.fr" className="field-input" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="password" className="field-label">Mot de passe</label>
          <span className="text-xs text-[var(--muted)]">8 caractères minimum</span>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input" />
      </div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <SubmitButton pendingLabel="Connexion en cours…">Se connecter</SubmitButton>
      <p className="text-center text-xs leading-5 text-[var(--muted)]">Vos informations restent confidentielles et sécurisées.</p>
      <p className="text-center text-sm text-[var(--muted)]">
        Pas encore de compte ? <Link href="/inscription" className="font-semibold text-[var(--coral-dark)] underline-offset-4 hover:underline">Créer un compte</Link>
      </p>
    </form>
  );
}
