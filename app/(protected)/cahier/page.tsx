import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { isNoteCategory, type NoteRecord } from "@/lib/notes/constants";
import { NoteCard } from "@/app/components/note-card";
import { NoteFilters } from "@/app/components/note-filters";

export default async function CahierPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireWorkspaceContext();
  const params = await searchParams;
  const readParam = (name: string) => {
    const value = params[name];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  const search = readParam("q").trim();
  const categoryParam = readParam("category");
  const category = isNoteCategory(categoryParam) ? categoryParam : "";
  const pinned = readParam("pinned") === "1";
  const supabase = await createClient();
  let notesQuery = supabase
    .from("notes")
    .select("id, title, content, category, occurred_at, visibility, is_pinned, created_at, updated_at")
    .eq("workspace_id", context.workspace.id)
    .order("is_pinned", { ascending: false })
    .order("occurred_at", { ascending: false, nullsFirst: false });

  if (search) notesQuery = notesQuery.textSearch("search_vector", search, { config: "french", type: "websearch" });
  if (category) notesQuery = notesQuery.eq("category", category);
  if (pinned) notesQuery = notesQuery.eq("is_pinned", true);

  const { data, error } = await notesQuery;
  if (error) throw new Error("Impossible de charger les notes.");
  const notes = (data ?? []) as NoteRecord[];
  const pinnedNotes = notes.filter((note) => note.is_pinned);
  const regularNotes = notes.filter((note) => !note.is_pinned);
  const hasFilters = Boolean(search || category || pinned);
  const message = readParam("created") ? "Note créée." : readParam("updated") ? "Note modifiée." : readParam("deleted") ? "Note supprimée définitivement." : "";

  return (
    <section className="animate-[fade-in_500ms_ease-out]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">A-LSH · Cahier</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">Cahier de travail</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">Vos notes personnelles, au même endroit. Elles restent strictement privées.</p></div><Link href="/cahier/nouvelle" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--coral)] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(228,121,95,0.22)] hover:bg-[var(--coral-dark)]">+ Nouvelle note</Link></div>
      <div className="mt-8"><NoteFilters search={search} category={category} pinned={pinned} /></div>
      {message ? <p className="mt-5 rounded-2xl border border-[var(--mint)] bg-[var(--mint-pale)] px-4 py-3 text-sm font-semibold text-[var(--ink-soft)]" role="status">{message}</p> : null}
      {notes.length === 0 ? <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--line)] bg-white/60 px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mint-pale)] text-2xl">✎</div><h2 className="mt-5 text-xl font-semibold text-[var(--ink)]">{hasFilters ? "Aucun résultat" : "Votre cahier est encore vide"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{hasFilters ? "Aucune note ne correspond à ces critères. Essayez une autre recherche ou retirez un filtre." : "Créez votre première note pour garder une information importante à portée de main."}</p>{!hasFilters ? <Link href="/cahier/nouvelle" className="mt-6 font-semibold text-[var(--coral-dark)] underline-offset-4 hover:underline">Créer une note</Link> : null}</div> : <div className="mt-8 space-y-9">{pinnedNotes.length ? <div><div className="mb-3 flex items-center gap-3"><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral-dark)]">Notes épinglées</h2><span className="h-px flex-1 bg-[var(--line)]" /></div><div className="grid gap-4 xl:grid-cols-2">{pinnedNotes.map((note) => <NoteCard key={note.id} note={note} featured />)}</div></div> : null}{regularNotes.length ? <div><div className="mb-3 flex items-center gap-3"><h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Toutes les notes</h2><span className="h-px flex-1 bg-[var(--line)]" /></div><div className="grid gap-4 xl:grid-cols-2">{regularNotes.map((note) => <NoteCard key={note.id} note={note} />)}</div></div> : null}</div>}
    </section>
  );
}
