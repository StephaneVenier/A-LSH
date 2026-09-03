"use client";

import { deleteEvent } from "@/app/actions/events";

export function DeleteEventForm({ id }: { id: string }) {
  return <form action={deleteEvent} onSubmit={(event) => { if (!window.confirm("Supprimer définitivement cet événement ? Cette action est irréversible.")) event.preventDefault(); }}><input type="hidden" name="id" value={id} /><button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#e8b2a6] bg-[#fff0ed] px-4 text-sm font-bold text-[var(--coral-dark)] transition hover:border-[var(--coral-dark)] hover:bg-[#ffe1d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral-dark)]">Supprimer l’événement</button></form>;
}
