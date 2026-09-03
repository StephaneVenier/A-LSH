import { formatAnimatorNoteDate, type AnimatorNoteRecord } from "@/lib/animators/constants";

export function AnimatorNoteCard({ note }: { note: AnimatorNoteRecord }) {
  return <article className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(31,65,54,0.05)]"><div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted)]"><time dateTime={note.occurred_at}>{formatAnimatorNoteDate(note.occurred_at)}</time><span aria-hidden="true">·</span><span>Note privée</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--ink-soft)]">{note.content}</p></article>;
}
