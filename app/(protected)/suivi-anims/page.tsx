import Link from "next/link";
import { AnimatorCard } from "@/app/components/animator-card";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import type { AnimatorRecord } from "@/lib/animators/constants";

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function AnimatorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireWorkspaceContext();
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const supabase = await createClient();
  let query = supabase.from("animators").select("id, workspace_id, name, created_by, is_active, created_at, updated_at").eq("workspace_id", context.workspace.id).eq("is_active", true).order("name", { ascending: true });
  if (search) query = query.ilike("name", `%${escapeLike(search)}%`);
  const { data, error } = await query;
  const animators = (data ?? []) as AnimatorRecord[];
  const notice = typeof params.created === "string" ? "La note a été ajoutée." : typeof params.archived === "string" ? "La fiche a été archivée." : "";

  return <section className="animate-[fade-in_500ms_ease-out]"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">A-LSH · Équipe</p><h1 className="page-title">Suivi anims</h1><p className="page-subtitle">Retrouvez les fiches d’équipe et vos observations privées, au même endroit.</p></div><Link href="/suivi-anims/nouvel-animateur" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--coral)] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(228,121,95,0.22)] hover:bg-[var(--coral-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral-dark)]">+ Nouvel animateur</Link></div>{notice ? <p className="mt-6 rounded-2xl bg-[var(--mint-pale)] px-4 py-3 text-sm font-semibold text-[var(--green)]" role="status">{notice}</p> : null}<form action="/suivi-anims" method="get" className="mt-8 flex flex-col gap-3 rounded-3xl border border-[var(--line)] bg-white/75 p-3 sm:flex-row sm:items-end sm:p-4"><div className="min-w-0 flex-1"><label htmlFor="animator-search" className="field-label">Rechercher un animateur</label><input id="animator-search" name="q" type="search" defaultValue={search} placeholder="Nom ou prénom…" className="field-input" /></div><button type="submit" className="min-h-12 rounded-2xl bg-[var(--ink)] px-5 text-sm font-bold text-white hover:bg-[var(--ink-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]">Rechercher</button></form>{error ? <p className="form-error mt-6" role="alert">Les fiches animateurs ne sont pas disponibles pour le moment.</p> : animators.length === 0 ? <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--line)] bg-white/55 px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mint-pale)] text-2xl">♧</div><h2 className="mt-5 text-xl font-semibold text-[var(--ink)]">{search ? "Aucun animateur trouvé" : "Aucun animateur enregistré"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{search ? "Essayez une autre recherche." : "Créez une première fiche pour commencer votre suivi d’équipe."}</p>{!search ? <Link href="/suivi-anims/nouvel-animateur" className="mt-6 font-semibold text-[var(--coral-dark)] underline-offset-4 hover:underline">Créer une fiche</Link> : null}</div> : <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{animators.map((animator) => <AnimatorCard key={animator.id} animator={animator} />)}</div>}</section>;
}
