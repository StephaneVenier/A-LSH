import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { WorkspaceForm } from "@/app/components/workspace-form";

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/connexion");
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Impossible de vérifier l’espace de travail.");
  }

  if (membership) {
    redirect("/tableau-de-bord");
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-black tracking-[-0.04em] text-[var(--ink)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--coral)] text-sm text-white">A</span>
            A-LSH
          </div>
          <form action={signOut}>
            <button type="submit" className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline">Se déconnecter</button>
          </form>
        </header>
        <div className="flex flex-1 items-center py-14">
          <section className="grid w-full gap-10 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">Bienvenue dans A-LSH</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">Commencez par créer votre espace.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">Votre espace de travail sera le point de ralliement de votre équipe. Donnez-lui un nom simple, que tout le monde reconnaîtra.</p>
            </div>
            <div className="rounded-3xl bg-[var(--mint-pale)] p-6 sm:p-8">
              <WorkspaceForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
