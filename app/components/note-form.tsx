"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { createNote, updateNote, type NoteActionState } from "@/app/actions/notes";
import { formatDateTimeLocal, noteCategories, type NoteRecord } from "@/lib/notes/constants";
import { SubmitButton } from "./submit-button";

const initialState: NoteActionState = {};

export function NoteForm({ note }: { note?: NoteRecord }) {
  const action = note ? updateNote : createNote;
  const [state, formAction] = useActionState(action, initialState);
  const timezoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timezoneRef.current) {
      timezoneRef.current.value = String(new Date().getTimezoneOffset());
    }
  }, []);

  return (
    <form action={formAction} className="space-y-6">
      {note ? <input type="hidden" name="id" value={note.id} /> : null}
      <input ref={timezoneRef} type="hidden" name="timezoneOffset" defaultValue="0" />
      <div>
        <label htmlFor="title" className="field-label">Titre <span className="text-[var(--coral-dark)]" aria-hidden="true">*</span></label>
        <input id="title" name="title" type="text" required maxLength={200} defaultValue={note?.title} placeholder="Ex. Transmission importante" className="field-input" />
      </div>
      <div>
        <label htmlFor="content" className="field-label">Contenu</label>
        <textarea id="content" name="content" rows={8} maxLength={100000} defaultValue={note?.content} placeholder="Écrivez les éléments à garder en tête…" className="field-input min-h-48 resize-y" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="field-label">Catégorie</label>
          <select id="category" name="category" defaultValue={note?.category ?? "Général"} className="field-input">
            {noteCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="occurredAt" className="field-label">Date et heure</label>
          <input id="occurredAt" name="occurredAt" type="datetime-local" required defaultValue={formatDateTimeLocal(note?.occurred_at ?? new Date().toISOString())} className="field-input" />
        </div>
      </div>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-sm font-semibold text-[var(--ink)]">
        <input type="checkbox" name="isPinned" defaultChecked={note?.is_pinned} className="h-5 w-5 accent-[var(--coral)]" />
        <span>Épingler cette note</span>
      </label>
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] px-4 py-3 text-sm leading-5 text-[var(--ink-soft)]"><span aria-hidden="true">🔒</span><p><strong>Cette note est privée.</strong><br />Elle est visible uniquement par vous.</p></div>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/cahier" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--background)]">Annuler</Link>
        <div className="sm:min-w-44"><SubmitButton pendingLabel={note ? "Enregistrement…" : "Création…"}>{note ? "Enregistrer" : "Créer la note"}</SubmitButton></div>
      </div>
    </form>
  );
}
