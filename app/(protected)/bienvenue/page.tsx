import { redirect } from "next/navigation";
import { WorkspaceForm } from "@/app/components/workspace-form";
import { getAuthContext } from "@/lib/auth/context";

export default async function WelcomePage() {
  const context = await getAuthContext();

  if (!context.user) {
    redirect("/connexion");
  }

  if (context.workspace) {
    redirect("/tableau-de-bord");
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl items-center py-8">
      <div className="grid w-full gap-10 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">Bienvenue dans A-LSH</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">Commencez par créer votre espace.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">Votre espace de travail sera le point de ralliement de votre équipe. Donnez-lui un nom simple, que tout le monde reconnaîtra.</p>
        </div>
        <div className="rounded-3xl bg-[var(--mint-pale)] p-6 sm:p-8">
          <WorkspaceForm />
        </div>
      </div>
    </section>
  );
}
