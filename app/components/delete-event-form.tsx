"use client";

import { deleteEvent } from "@/app/actions/events";

export function DeleteEventForm({ id }: { id: string }) {
  return <form action={deleteEvent} onSubmit={(event) => { if (!window.confirm("Supprimer définitivement cet événement ? Cette action est irréversible.")) event.preventDefault(); }}><input type="hidden" name="id" value={id} /><button type="submit" className="touch-target text-sm font-semibold text-[var(--coral-dark)] hover:underline">Supprimer</button></form>;
}
