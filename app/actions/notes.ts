"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isNoteCategory } from "@/lib/notes/constants";
import { requireWorkspaceContext } from "@/lib/auth/context";

export type NoteActionState = {
  error?: string;
};

function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function readContent(formData: FormData) {
  return String(formData.get("content") ?? "");
}

function readPinned(formData: FormData) {
  return formData.get("isPinned") === "on";
}

function readOccurredAt(formData: FormData) {
  const value = readText(formData, "occurredAt");
  if (!value) return { value: null };

  const offset = Number(readText(formData, "timezoneOffset"));
  if (!Number.isInteger(offset) || Math.abs(offset) > 840) {
    return { error: "Le fuseau horaire choisi est invalide." };
  }

  const sign = offset <= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offset);
  const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const minutes = String(absoluteOffset % 60).padStart(2, "0");
  const date = new Date(`${value}:00${sign}${hours}:${minutes}`);
  if (Number.isNaN(date.getTime())) {
    return { error: "Choisissez une date et une heure valides." };
  }

  return { value: date.toISOString() };
}

function validateNote(formData: FormData) {
  const title = readText(formData, "title");
  const content = readContent(formData);
  const category = readText(formData, "category");
  const occurredAt = readOccurredAt(formData);

  if (title.length < 1 || title.length > 200) {
    return { error: "Le titre doit contenir entre 1 et 200 caractères." };
  }

  if (content.length > 100_000) {
    return { error: "Le contenu ne peut pas dépasser 100 000 caractères." };
  }

  if (category && !isNoteCategory(category)) {
    return { error: "Choisissez une catégorie proposée." };
  }

  if ("error" in occurredAt) return { error: occurredAt.error };

  return {
    value: {
      title,
      content,
      category: category || null,
      occurred_at: occurredAt.value,
      is_pinned: readPinned(formData),
      visibility: "private" as const,
    },
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createNote(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const context = await requireWorkspaceContext();
  const validation = validateNote(formData);

  if ("error" in validation) return { error: validation.error };

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    ...validation.value,
    workspace_id: context.workspace.id,
    created_by: context.user.id,
  });

  if (error) return { error: "La note n’a pas pu être créée. Réessayez." };

  revalidatePath("/cahier");
  redirect("/cahier?created=1");
}

export async function updateNote(
  _previousState: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const context = await requireWorkspaceContext();
  const id = readText(formData, "id");

  if (!isUuid(id)) return { error: "Cette note n’est pas reconnue." };

  const validation = validateNote(formData);
  if ("error" in validation) return { error: validation.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .update(validation.value)
    .eq("id", id)
    .eq("workspace_id", context.workspace.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "La note n’a pas pu être modifiée ou n’est plus accessible." };
  }

  revalidatePath("/cahier");
  revalidatePath(`/cahier/${id}/modifier`);
  redirect("/cahier?updated=1");
}

export async function deleteNote(formData: FormData) {
  const context = await requireWorkspaceContext();
  const id = readText(formData, "id");

  if (!isUuid(id)) redirect("/cahier?error=delete");

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("workspace_id", context.workspace.id);

  if (error) redirect("/cahier?error=delete");

  revalidatePath("/cahier");
  redirect("/cahier?deleted=1");
}
