import Link from "next/link";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { NoteForm } from "@/app/components/note-form";

export default async function NewNotePage() {
  await requireWorkspaceContext();
  return <section className="mx-auto max-w-3xl"><Link href="/cahier" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">← Retour au cahier</Link><div className="mt-6 rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">Cahier de travail</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-4xl">Nouvelle note</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Notez ce que vous souhaitez garder près de vous.</p><div className="mt-8"><NoteForm /></div></div></section>;
}
