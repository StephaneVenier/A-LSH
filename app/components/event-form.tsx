"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createEvent, updateEvent, type EventActionState } from "@/app/actions/events";
import { eventCategories, eventColors, type EventRecord } from "@/lib/agenda/constants";
import { SubmitButton } from "./submit-button";

const initialState: EventActionState = {};

export function EventForm({ event, initialDate, initialTime }: { event?: EventRecord; initialDate?: string; initialTime?: string }) {
  const [state, formAction] = useActionState(event ? updateEvent : createEvent, initialState);
  const [allDay, setAllDay] = useState(event?.is_all_day ?? false);
  const defaultDate = event?.start_date ?? initialDate ?? new Intl.DateTimeFormat("fr-CA").format(new Date());
  const defaultEndDate = event?.end_date ?? initialDate ?? defaultDate;
  const defaultStartTime = event?.start_time?.slice(0, 5) ?? initialTime ?? "09:00";
  const defaultEndTime = event?.end_time?.slice(0, 5) ?? (initialTime ? `${String(Math.min(Number(initialTime.slice(0, 2)) + 1, 23)).padStart(2, "0")}:${initialTime.slice(3, 5)}` : "10:00");

  return <form action={formAction} className="space-y-6">
    {event ? <input type="hidden" name="id" value={event.id} /> : null}
    <div><label htmlFor="event-title" className="field-label">Titre <span className="text-[var(--coral-dark)]" aria-hidden="true">*</span></label><input id="event-title" name="title" type="text" required maxLength={200} defaultValue={event?.title} placeholder="Ex. Réunion de préparation" className="field-input" /></div>
    <div><label htmlFor="event-description" className="field-label">Description</label><textarea id="event-description" name="description" rows={5} maxLength={100000} defaultValue={event?.description ?? ""} placeholder="Ajoutez les informations utiles…" className="field-input min-h-32 resize-y" /></div>
    <div className="grid gap-6 sm:grid-cols-2"><div><label htmlFor="event-location" className="field-label">Lieu</label><input id="event-location" name="location" type="text" maxLength={300} defaultValue={event?.location ?? ""} placeholder="Ex. Salle polyvalente" className="field-input" /></div><div><label htmlFor="event-category" className="field-label">Catégorie</label><select id="event-category" name="category" defaultValue={event?.category ?? "Général"} className="field-input">{eventCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>
    <div><label htmlFor="event-color" className="field-label">Couleur</label><select id="event-color" name="color" defaultValue={event?.color ?? "green"} className="field-input sm:max-w-xs">{eventColors.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></div>
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"><input type="checkbox" name="isAllDay" defaultChecked={event?.is_all_day} onChange={(e) => setAllDay(e.target.checked)} className="h-5 w-5 accent-[var(--coral)]" /><span>Journée entière</span></label>
    <div className="grid gap-6 sm:grid-cols-2"><div><label htmlFor="event-start-date" className="field-label">Date de début</label><input id="event-start-date" name="startDate" type="date" required defaultValue={defaultDate} className="field-input" /></div><div><label htmlFor="event-end-date" className="field-label">Date de fin</label><input id="event-end-date" name="endDate" type="date" required defaultValue={defaultEndDate} className="field-input" /></div></div>
    <div className="grid gap-6 sm:grid-cols-2"><div><label htmlFor="event-start-time" className="field-label">Heure de début</label><input id="event-start-time" name="startTime" type="time" required={!allDay} disabled={allDay} defaultValue={defaultStartTime} className="field-input" /></div><div><label htmlFor="event-end-time" className="field-label">Heure de fin</label><input id="event-end-time" name="endTime" type="time" required={!allDay} disabled={allDay} defaultValue={defaultEndTime} className="field-input" /></div></div>
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] px-4 py-3 text-sm leading-5 text-[var(--ink-soft)]"><span aria-hidden="true">🔒</span><p><strong>Cet événement est privé.</strong><br />Il est visible uniquement par vous.</p></div>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/agenda" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)]">Annuler</Link><div className="sm:min-w-48"><SubmitButton pendingLabel={event ? "Enregistrement…" : "Création…"}>{event ? "Enregistrer" : "Créer l’événement"}</SubmitButton></div></div>
  </form>;
}
