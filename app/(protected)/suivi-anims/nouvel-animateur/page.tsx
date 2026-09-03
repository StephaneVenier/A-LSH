import Link from "next/link";
import { AnimatorForm } from "@/app/components/animator-form";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function NewAnimatorPage() {
  await requireWorkspaceContext();
  return <section className="mx-auto max-w-3xl"><Link href="/suivi-anims" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">← Retour au suivi anims</Link><div className="mt-6 rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-10"><p className="eyebrow">Suivi anims</p><h1 className="mt-3 page-title">Nouvel animateur</h1><p className="mt-3 page-subtitle">Créez une fiche simple pour retrouver rapidement ce nom dans votre espace.</p><div className="mt-8"><AnimatorForm /></div></div></section>;
}
