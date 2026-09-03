import Link from "next/link";
import type { AnimatorRecord } from "@/lib/animators/constants";

export function AnimatorCard({ animator }: { animator: AnimatorRecord }) {
  return <Link href={`/suivi-anims/${animator.id}`} className="group flex min-h-20 items-center justify-between gap-4 rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(31,65,54,0.05)] transition hover:-translate-y-0.5 hover:border-[var(--mint)] hover:shadow-[0_14px_34px_rgba(31,65,54,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral)]"><span className="min-w-0"><span className="block truncate text-base font-bold text-[var(--ink)]">{animator.name}</span><span className="mt-1 block text-xs text-[var(--muted)]">Fiche active</span></span><span aria-hidden="true" className="text-xl text-[var(--coral-dark)] transition group-hover:translate-x-1">→</span></Link>;
}
