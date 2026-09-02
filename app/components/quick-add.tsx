"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./icons";

const choices = [
  { label: "Note", href: "/cahier/nouvelle", disabled: false },
  { label: "Événement", href: "/agenda/nouvel-evenement", disabled: false },
  { label: "Tâche", href: "/taches/nouvelle", disabled: false },
  { label: "Suivi enfant", disabled: true },
] as const;

export function QuickAdd() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="fixed bottom-24 right-5 z-30 lg:bottom-8 lg:right-8">
      {open ? <div className="absolute bottom-16 right-0 w-56 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[0_18px_50px_rgba(23,48,43,0.18)]" role="menu" aria-label="Ajouter"><p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Ajouter</p>{choices.map((choice) => choice.disabled ? <span key={choice.label} role="menuitem" aria-disabled="true" className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-[var(--muted)]/60"><span>{choice.label}</span><span className="text-[0.65rem] font-bold uppercase tracking-[0.1em]">Bientôt</span></span> : <Link key={choice.label} href={choice.href} role="menuitem" onClick={() => setOpen(false)} className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mint-pale)]"><span>{choice.label}</span><span aria-hidden="true">→</span></Link>)}</div> : null}
      <button type="button" aria-label="Ajouter" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-2xl bg-[var(--coral)] px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(228,121,95,0.3)] transition hover:bg-[var(--coral-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--coral-dark)]"><Icon name="plus" /> <span className="hidden sm:inline">Ajouter</span></button>
    </div>
  );
}
