"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

export type ChildActionState = { error?: string };

function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createChild(
  _previousState: ChildActionState,
  formData: FormData,
): Promise<ChildActionState> {
  const context = await requireWorkspaceContext();
  const name = readText(formData, "name");

  if (name.length < 1 || name.length > 200) {
    return { error: "Le nom doit contenir entre 1 et 200 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .insert({
      name,
      workspace_id: context.workspace.id,
      created_by: context.user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Cet enfant existe déjà dans votre espace." };
    }
    console.error("[children] create failed", { code: error.code });
    return { error: "L’enfant n’a pas pu être enregistré. Réessayez." };
  }

  revalidatePath("/suivi-enfants");
  redirect(`/suivi-enfants/${data.id}`);
}

export async function createChildNote(
  _previousState: ChildActionState,
  formData: FormData,
): Promise<ChildActionState> {
  const context = await requireWorkspaceContext();
  const childId = readText(formData, "childId");
  const content = String(formData.get("content") ?? "");

  if (!isUuid(childId)) return { error: "Cet enfant n’est pas reconnu." };
  if (content.trim().length < 1 || content.length > 100_000) {
    return { error: "La note doit contenir entre 1 et 100 000 caractères." };
  }

  const supabase = await createClient();
  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("workspace_id", context.workspace.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!child) return { error: "Cet enfant n’est pas accessible." };

  const { error } = await supabase.from("child_notes").insert({
    child_id: childId,
    workspace_id: context.workspace.id,
    created_by: context.user.id,
    content,
  });

  if (error) {
    console.error("[children] note create failed", { code: error.code });
    return { error: "La note n’a pas pu être ajoutée. Réessayez." };
  }

  revalidatePath(`/suivi-enfants/${childId}`);
  redirect(`/suivi-enfants/${childId}?created=1`);
}

export async function archiveChild(formData: FormData) {
  const context = await requireWorkspaceContext();
  const childId = readText(formData, "childId");

  if (!isUuid(childId)) redirect("/suivi-enfants?error=archive");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .update({ is_active: false })
    .eq("id", childId)
    .eq("workspace_id", context.workspace.id)
    .eq("created_by", context.user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) redirect(`/suivi-enfants/${childId}?error=archive`);

  revalidatePath("/suivi-enfants");
  revalidatePath(`/suivi-enfants/${childId}`);
  redirect("/suivi-enfants?archived=1");
}
