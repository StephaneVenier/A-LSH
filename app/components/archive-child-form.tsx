"use client";

import { archiveChild } from "@/app/actions/children";

export function ArchiveChildForm({ childId }: { childId: string }) {
  return <form action={archiveChild} onSubmit={(event) => { if (!window.confirm("Archiver cette fiche ? Son historique sera conservé et aucune nouvelle note ne pourra être ajoutée.")) event.preventDefault(); }}><input type="hidden" name="childId" value={childId} /><button type="submit" className="min-h-11 rounded-2xl border border-[#e6b5aa] px-4 text-sm font-bold text-[var(--coral-dark)] hover:bg-[#fff0ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral-dark)]">Archiver la fiche</button></form>;
}
