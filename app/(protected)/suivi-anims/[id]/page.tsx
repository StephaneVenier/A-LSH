import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimatorNoteCard } from "@/app/components/animator-note-card";
import { AnimatorNoteForm } from "@/app/components/animator-note-form";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import type { AnimatorNoteRecord } from "@/lib/animators/constants";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function AnimatorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireWorkspaceContext();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const queryParams = await searchParams;
  const supabase = await createClient();
  const [{ data: animator, error: animatorError }, { data: notes, error: notesError }] = await Promise.all([
    supabase.from("animators").select("id, name, is_active").eq("id", id).eq("workspace_id", context.workspace.id).maybeSingle(),
    supabase.from("animator_notes").select("id, animator_id, content, created_by, occurred_at, created_at, updated_at").eq("animator_id", id).eq("workspace_id", context.workspace.id).eq("created_by", context.user.id).order("occurred_at", { ascending: false }),
  ]);
  if (animatorError || !animator) notFound();
  const notice = typeof queryParams.created === "string" ? "La note a été ajoutée." : "";
  const animatorNotes = (notes ?? []) as AnimatorNoteRecord[];

  return <section className="animate-[fade-in_500ms_ease-out]"><Link href="/suivi-anims" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">← Retour au suivi anims</Link><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Fiche animateur</p><h1 className="page-title">{animator.name}</h1><p className="page-subtitle">Vos observations privées, conservées dans l’historique.</p></div>{animator.is_active ? <a href="#ajouter-note" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--coral)] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(228,121,95,0.22)] hover:bg-[var(--coral-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral-dark)]">+ Ajouter une note</a> : <span className="rounded-full bg-[var(--mint-pale)] px-3 py-2 text-xs font-bold text-[var(--ink-soft)]">Fiche archivée</span>}</div>{notice ? <p className="mt-6 rounded-2xl bg-[var(--mint-pale)] px-4 py-3 text-sm font-semibold text-[var(--green)]" role="status">{notice}</p> : null}<div id="ajouter-note" className="mt-8 rounded-[2rem] border border-[var(--mint)] bg-[var(--mint-pale)] p-5 sm:p-7"><h2 className="text-xl font-semibold text-[var(--ink)]">Ajouter une note</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">La date et l’heure sont enregistrées automatiquement.</p><div className="mt-6">{animator.is_active ? <AnimatorNoteForm animatorId={animator.id} /> : <p className="text-sm font-semibold text-[var(--ink-soft)]">Cette fiche est archivée et ne peut plus recevoir de nouvelle note.</p>}</div></div><div className="mt-10"><div className="flex items-center gap-3"><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral-dark)]">Votre historique</h2><span className="h-px flex-1 bg-[var(--line)]" /></div>{notesError ? <p className="form-error mt-4" role="alert">L’historique n’est pas disponible pour le moment.</p> : animatorNotes.length === 0 ? <div className="mt-4 rounded-3xl border border-dashed border-[var(--line)] bg-white/55 px-6 py-12 text-center"><p className="text-sm leading-6 text-[var(--muted)]">Aucune note privée pour cet animateur. Ajoutez votre première observation ci-dessus.</p></div> : <div className="mt-4 space-y-4">{animatorNotes.map((note) => <AnimatorNoteCard key={note.id} note={note} />)}</div>}</div></section>;
}
