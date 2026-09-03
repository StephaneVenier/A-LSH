"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

export type AnimatorActionState = { error?: string };

function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createAnimator(
  _previousState: AnimatorActionState,
  formData: FormData,
): Promise<AnimatorActionState> {
  const context = await requireWorkspaceContext();
  const name = readText(formData, "name");

  if (name.length < 1 || name.length > 200) {
    return { error: "Le nom doit contenir entre 1 et 200 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animators")
    .insert({
      name,
      workspace_id: context.workspace.id,
      created_by: context.user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Cet animateur existe déjà dans votre espace." };
    }
    console.error("[animators] create failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { error: "L’animateur n’a pas pu être enregistré. Réessayez." };
  }

  revalidatePath("/suivi-anims");
  redirect(`/suivi-anims/${data.id}`);
}

export async function createAnimatorNote(
  _previousState: AnimatorActionState,
  formData: FormData,
): Promise<AnimatorActionState> {
  const context = await requireWorkspaceContext();
  const animatorId = readText(formData, "animatorId");
  const content = String(formData.get("content") ?? "");

  if (!isUuid(animatorId)) return { error: "Cet animateur n’est pas reconnu." };
  if (content.trim().length < 1 || content.length > 100_000) {
    return { error: "La note doit contenir entre 1 et 100 000 caractères." };
  }

  const supabase = await createClient();
  const { data: animator } = await supabase
    .from("animators")
    .select("id")
    .eq("id", animatorId)
    .eq("workspace_id", context.workspace.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!animator) return { error: "Cet animateur n’est pas accessible." };

  const { error } = await supabase.from("animator_notes").insert({
    animator_id: animatorId,
    workspace_id: context.workspace.id,
    created_by: context.user.id,
    content,
  });

  if (error) {
    console.error("[animators] note create failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { error: "La note n’a pas pu être ajoutée. Réessayez." };
  }

  revalidatePath(`/suivi-anims/${animatorId}`);
  redirect(`/suivi-anims/${animatorId}?created=1`);
}
