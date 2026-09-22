import Link from "next/link";
import { ChildForm } from "@/app/components/child-form";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function NewChildPage() {
  await requireWorkspaceContext();
  return <section className="mx-auto max-w-3xl"><Link href="/suivi-enfants" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">← Retour au suivi enfants</Link><div className="mt-6 rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-10"><p className="eyebrow">Suivi enfants</p><h1 className="mt-3 page-title">Nouvel enfant</h1><p className="mt-3 page-subtitle">Créez une fiche simple, sans ajouter d’informations personnelles inutiles.</p><div className="mt-8"><ChildForm /></div></div></section>;
}
