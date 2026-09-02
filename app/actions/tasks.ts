"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { isTaskCategory, isTaskPriority, isTaskStatus } from "@/lib/tasks/constants";

export type TaskActionState = { error?: string };

function readText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function readDescription(formData: FormData) {
  return String(formData.get("description") ?? "");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function readDueDate(formData: FormData) {
  const value = readText(formData, "dueDate");
  if (!value) return null;
  return isValidDate(value) ? value : undefined;
}

function readDueTime(formData: FormData) {
  const value = readText(formData, "dueTime");
  if (!value) return null;
  if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(value)) return undefined;
  const [hours, minutes] = value.split(":").map(Number);
  return hours < 24 && minutes < 60 ? value.slice(0, 5) : undefined;
}

function validateTask(formData: FormData) {
  const title = readText(formData, "title");
  const description = readDescription(formData);
  const category = readText(formData, "category");
  const priority = readText(formData, "priority");
  const status = readText(formData, "status");
  const dueDate = readDueDate(formData);
  const dueTime = readDueTime(formData);

  if (title.length < 1 || title.length > 200) return { error: "Le titre doit contenir entre 1 et 200 caractères." };
  if (description.length > 100_000) return { error: "La description ne peut pas dépasser 100 000 caractères." };
  if (category && !isTaskCategory(category)) return { error: "Choisissez une catégorie proposée." };
  if (!isTaskPriority(priority)) return { error: "Choisissez une priorité valide." };
  if (!isTaskStatus(status)) return { error: "Choisissez un statut valide." };
  if (dueDate === undefined) return { error: "Choisissez une date d’échéance valide." };
  if (dueTime === undefined) return { error: "Choisissez une heure d’échéance valide." };
  if (!dueDate && dueTime) return { error: "Une heure d’échéance nécessite une date." };

  return {
    value: {
      title,
      description: description || null,
      category: category || null,
      priority,
      status,
      due_date: dueDate,
      due_time: dueTime,
      is_pinned: formData.get("isPinned") === "on",
      visibility: "private" as const,
    },
  };
}

export async function createTask(_previousState: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const context = await requireWorkspaceContext();
  const validation = validateTask(formData);
  if ("error" in validation) return { error: validation.error };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    ...validation.value,
    workspace_id: context.workspace.id,
    created_by: context.user.id,
  });
  if (error) return { error: "La tâche n’a pas pu être créée. Réessayez." };

  revalidatePath("/taches");
  revalidatePath("/tableau-de-bord");
  redirect("/taches?created=1");
}

export async function updateTask(_previousState: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const context = await requireWorkspaceContext();
  const id = readText(formData, "id");
  if (!isUuid(id)) return { error: "Cette tâche n’est pas reconnue." };
  const validation = validateTask(formData);
  if ("error" in validation) return { error: validation.error };

  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").update(validation.value)
    .eq("id", id).eq("workspace_id", context.workspace.id).select("id").maybeSingle();
  if (error || !data) return { error: "La tâche n’a pas pu être modifiée ou n’est plus accessible." };

  revalidatePath("/taches");
  revalidatePath(`/taches/${id}/modifier`);
  revalidatePath("/tableau-de-bord");
  redirect("/taches?updated=1");
}

async function getOwnedTask(id: string) {
  const context = await requireWorkspaceContext();
  if (!isUuid(id)) return { context, task: null };
  const supabase = await createClient();
  const { data: task } = await supabase.from("tasks").select("status, is_pinned")
    .eq("id", id).eq("workspace_id", context.workspace.id).maybeSingle();
  return { context, task };
}

export async function toggleTaskStatus(formData: FormData) {
  const id = readText(formData, "id");
  const { context, task } = await getOwnedTask(id);
  if (!task) redirect("/taches?error=update");
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status: task.status === "done" ? "todo" : "done" })
    .eq("id", id).eq("workspace_id", context.workspace.id);
  if (error) redirect("/taches?error=update");
  revalidatePath("/taches"); revalidatePath("/tableau-de-bord"); redirect("/taches?updated=1");
}

export async function toggleTaskPinned(formData: FormData) {
  const id = readText(formData, "id");
  const { context, task } = await getOwnedTask(id);
  if (!task) redirect("/taches?error=update");
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ is_pinned: !task.is_pinned })
    .eq("id", id).eq("workspace_id", context.workspace.id);
  if (error) redirect("/taches?error=update");
  revalidatePath("/taches"); redirect("/taches?updated=1");
}

export async function deleteTask(formData: FormData) {
  const context = await requireWorkspaceContext();
  const id = readText(formData, "id");
  if (!isUuid(id)) redirect("/taches?error=delete");
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("workspace_id", context.workspace.id);
  if (error) redirect("/taches?error=delete");
  revalidatePath("/taches"); revalidatePath("/tableau-de-bord"); redirect("/taches?deleted=1");
}
