"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  error?: string;
  success?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "L’adresse e-mail ou le mot de passe est incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirmez votre adresse e-mail avant de vous connecter.";
  }

  if (normalized.includes("rate limit")) {
    return "Trop de tentatives. Patientez quelques instants puis réessayez.";
  }

  return "Impossible de terminer l’opération. Vérifiez les informations saisies puis réessayez.";
}

export async function signIn(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = readText(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!emailPattern.test(email)) {
    return { error: "Saisissez une adresse e-mail valide." };
  }

  if (!password) {
    return { error: "Saisissez votre mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  redirect("/");
}

export async function signUp(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const displayName = readText(formData, "displayName");
  const email = readText(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(
    formData.get("passwordConfirmation") ?? "",
  );

  if (displayName.length < 2 || displayName.length > 120) {
    return { error: "Le nom d’affichage doit contenir entre 2 et 120 caractères." };
  }

  if (!emailPattern.test(email)) {
    return { error: "Saisissez une adresse e-mail valide." };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  if (password !== passwordConfirmation) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  if (!data.session) {
    return {
      success:
        "Votre compte est presque prêt. Consultez votre boîte e-mail et cliquez sur le lien de confirmation pour continuer.",
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
