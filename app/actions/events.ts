"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { isEventCategory, isEventColor, isIsoDate } from "@/lib/agenda/constants";

export type EventActionState = { error?: string };

function readText(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }
function readLongText(formData: FormData, name: string) { return String(formData.get(name) ?? ""); }
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

function validTime(value: string) {
  if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(value)) return false;
  const [hours, minutes] = value.split(":").map(Number);
  return hours < 24 && minutes < 60;
}

function validateEvent(formData: FormData) {
  const title = readText(formData, "title");
  const description = readLongText(formData, "description");
  const location = readLongText(formData, "location").trim();
  const category = readText(formData, "category");
  const color = readText(formData, "color");
  const startDate = readText(formData, "startDate");
  const endDate = readText(formData, "endDate");
  const allDay = formData.get("isAllDay") === "on";
  const startTime = readText(formData, "startTime");
  const endTime = readText(formData, "endTime");

  if (title.length < 1 || title.length > 200) return { error: "Le titre doit contenir entre 1 et 200 caractères." };
  if (description.length > 100000) return { error: "La description ne peut pas dépasser 100 000 caractères." };
  if (location.length > 300) return { error: "Le lieu ne peut pas dépasser 300 caractères." };
  if (category && !isEventCategory(category)) return { error: "Choisissez une catégorie proposée." };
  if (!isEventColor(color)) return { error: "Choisissez une couleur proposée." };
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return { error: "Choisissez des dates valides." };
  if (endDate < startDate) return { error: "La date de fin ne peut pas précéder la date de début." };
  if (allDay && (startTime || endTime)) return { error: "Une journée entière ne peut pas avoir d’horaires." };
  if (!allDay && (!validTime(startTime) || !validTime(endTime))) return { error: "Un événement horaire doit avoir une heure de début et de fin valides." };
  if (!allDay && startDate === endDate && endTime <= startTime) return { error: "L’heure de fin doit être postérieure à l’heure de début." };

  return { value: { title, description, location, category: category || null, color, start_date: startDate, start_time: allDay ? null : startTime.slice(0, 5), end_date: endDate, end_time: allDay ? null : endTime.slice(0, 5), is_all_day: allDay, visibility: "private" as const } };
}

export async function createEvent(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const context = await requireWorkspaceContext();
  const validation = validateEvent(formData);
  if ("error" in validation) return { error: validation.error };
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ ...validation.value, workspace_id: context.workspace.id, created_by: context.user.id });
  if (error) {
    console.error("[createEvent] Supabase INSERT failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return { error: "L’événement n’a pas pu être créé. Réessayez." };
  }
  revalidatePath("/agenda"); revalidatePath("/tableau-de-bord");
  redirect(`/agenda?date=${validation.value.start_date}&vue=jour&created=1`);
}

export async function updateEvent(_previousState: EventActionState, formData: FormData): Promise<EventActionState> {
  const context = await requireWorkspaceContext();
  const id = readText(formData, "id");
  if (!isUuid(id)) return { error: "Cet événement n’est pas reconnu." };
  const validation = validateEvent(formData);
  if ("error" in validation) return { error: validation.error };
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").update(validation.value).eq("id", id).eq("workspace_id", context.workspace.id).select("id").maybeSingle();
  if (error || !data) return { error: "L’événement n’a pas pu être modifié ou n’est plus accessible." };
  revalidatePath("/agenda"); revalidatePath(`/agenda/${id}/modifier`); revalidatePath("/tableau-de-bord");
  redirect(`/agenda?date=${validation.value.start_date}&vue=jour&updated=1`);
}

export async function deleteEvent(formData: FormData) {
  const context = await requireWorkspaceContext();
  const id = readText(formData, "id");
  if (!isUuid(id)) redirect("/agenda?error=delete");
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").delete().eq("id", id).eq("workspace_id", context.workspace.id).select("id").maybeSingle();
  if (error || !data) {
    if (error) {
      console.error("[deleteEvent] Supabase DELETE failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }
    redirect("/agenda?error=delete");
  }
  revalidatePath("/agenda"); revalidatePath("/tableau-de-bord"); redirect("/agenda?deleted=1");
}
