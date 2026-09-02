import Link from "next/link";
import { DeleteNoteForm } from "./delete-note-form";
import { formatNoteDate, type NoteRecord } from "@/lib/notes/constants";

export function NoteCard({ note, featured = false }: { note: NoteRecord; featured?: boolean }) {
  return (
    <article className={`rounded-3xl border bg-white/90 p-5 shadow-[0_10px_30px_rgba(23,48,43,0.05)] transition hover:border-[var(--mint)] ${featured ? "border-[var(--mint)] ring-1 ring-[var(--mint)]/30" : "border-[var(--line)]"}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${featured ? "bg-[var(--coral)]" : "bg-[var(--mint)]"}`} title={featured ? "Note épinglée" : undefined} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-base font-semibold text-[var(--ink)]">{note.title}</h3>{featured ? <span className="rounded-full bg-[#fff0ed] px-2 py-1 text-[0.68rem] font-bold text-[var(--coral-dark)]">Épinglée</span> : null}</div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--muted)]"><time dateTime={note.occurred_at ?? note.created_at}>{formatNoteDate(note.occurred_at)}</time><span className="h-1 w-1 rounded-full bg-[var(--line)]" /><span>{note.category ?? "Général"}</span><span className="h-1 w-1 rounded-full bg-[var(--line)]" /><span>Privée</span></div>
        </div>
        <div className="flex shrink-0 items-center gap-1"><Link href={`/cahier/${note.id}/modifier`} className="rounded-xl px-2.5 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:bg-[var(--mint-pale)]">Modifier</Link><DeleteNoteForm id={note.id} /></div>
      </div>
      <details className="group mt-4 border-t border-[var(--line)] pt-3"><summary className="cursor-pointer list-none text-xs font-semibold text-[var(--ink-soft)] underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden"><span className="group-open:hidden">Afficher le contenu</span><span className="hidden group-open:inline">Masquer le contenu</span></summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{note.content || "Aucun contenu dans cette note."}</p></details>
    </article>
  );
}
