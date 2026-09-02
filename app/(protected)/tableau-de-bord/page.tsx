import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/connexion");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error("Impossible de charger votre espace de travail.");
  }

  if (!membership) {
    redirect("/bienvenue");
  }

  const [{ data: workspace, error: workspaceError }, { data: profile }] = await Promise.all([
    supabase.from("workspaces").select("id, name").eq("id", membership.workspace_id).single(),
    supabase.from("profiles").select("display_name").eq("id", userData.user.id).maybeSingle(),
  ]);

  if (workspaceError || !workspace) {
    throw new Error("Impossible de charger votre espace de travail.");
  }

  const displayName =
    profile?.display_name?.trim() ||
    userData.user.user_metadata?.display_name ||
    userData.user.email?.split("@")[0] ||
    "vous";

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-5">
          <div className="flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-[var(--ink)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--coral)] text-sm text-white">A</span>
            A-LSH
          </div>
          <form action={signOut}>
            <button type="submit" className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--coral)] hover:text-[var(--coral-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]">Se déconnecter</button>
          </form>
        </header>
        <section className="flex flex-1 items-center py-14">
          <div className="w-full rounded-[2rem] border border-[var(--line)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">Tableau de bord</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Bonjour {displayName}</h1>
            <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-[var(--mint-pale)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Votre espace de travail</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{workspace.name}</p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">Espace actif</span>
            </div>
            <p className="mt-8 text-sm leading-6 text-[var(--muted)]">Votre tableau de bord est prêt. Les premiers modules métier arriveront bientôt.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
