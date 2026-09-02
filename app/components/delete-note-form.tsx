"use client";

import { deleteNote } from "@/app/actions/notes";
import { useFormStatus } from "react-dom";

function DeleteButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="rounded-xl px-3 py-2 text-xs font-semibold text-[var(--coral-dark)] hover:bg-[#fff0ed] disabled:opacity-50">{pending ? "Suppression…" : "Supprimer"}</button>;
}

export function DeleteNoteForm({ id }: { id: string }) {
  return <form action={deleteNote} onSubmit={(event) => { if (!window.confirm("Supprimer définitivement cette note ? Cette action est irréversible.")) event.preventDefault(); }}><input type="hidden" name="id" value={id} /><DeleteButton /></form>;
}
