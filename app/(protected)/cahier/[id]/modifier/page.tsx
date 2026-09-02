import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { NoteForm } from "@/app/components/note-form";
import type { NoteRecord } from "@/lib/notes/constants";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireWorkspaceContext();
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("notes").select("id, title, content, category, occurred_at, visibility, is_pinned, created_at, updated_at").eq("id", id).eq("workspace_id", context.workspace.id).maybeSingle();

  if (error || !data) notFound();

  return <section className="mx-auto max-w-3xl"><Link href="/cahier" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">← Retour au cahier</Link><div className="mt-6 rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">Cahier de travail</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-4xl">Modifier la note</h1><div className="mt-8"><NoteForm note={data as NoteRecord} /></div></div></section>;
}
