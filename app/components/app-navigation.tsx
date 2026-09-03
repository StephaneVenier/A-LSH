"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icons";

const navigation = [
  { href: "/tableau-de-bord", label: "Aujourd’hui", shortLabel: "Aujourd’hui", icon: "today" as const },
  { href: "/cahier", label: "Cahier de travail", shortLabel: "Cahier", icon: "notebook" as const },
  { href: "/agenda", label: "Agenda", shortLabel: "Agenda", icon: "calendar" as const },
  { href: "/taches", label: "Tâches", shortLabel: "Tâches", icon: "tasks" as const },
  { href: "/suivi-enfants", label: "Suivi enfants", shortLabel: "Suivi", icon: "children" as const },
  { href: "/suivi-anims", label: "Suivi anims", shortLabel: "Anims", icon: "children" as const },
  { href: "/sessions", label: "Sessions & vacances", shortLabel: "Sessions", icon: "sun" as const },
  { href: "/projets", label: "Projets", shortLabel: "Projets", icon: "projects" as const },
  { href: "/formations", label: "Formations", shortLabel: "Formations", icon: "training" as const },
  { href: "/recherche", label: "Recherche", shortLabel: "Recherche", icon: "search" as const },
  { href: "/parametres", label: "Paramètres", shortLabel: "Paramètres", icon: "settings" as const },
];

const mobileNavigation = navigation.filter(({ href }) =>
  ["/tableau-de-bord", "/cahier", "/agenda", "/recherche"].includes(href),
);

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/tableau-de-bord" && pathname.startsWith(`${href}/`));
}

export function AppNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--line)] lg:bg-[var(--ink)] lg:px-4 lg:py-6 lg:text-white">
        <nav aria-label="Navigation principale" className="mt-14 flex flex-1 flex-col gap-1">
          {navigation.map((item) => {
            const active = isActive(pathname, item.href);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${active ? "bg-white/12 text-white" : "text-white/58 hover:bg-white/8 hover:text-white"}`}><span className={active ? "text-[var(--coral)]" : "text-white/55 group-hover:text-[var(--mint-light)]"}><Icon name={item.icon} /></span><span>{item.label}</span>{active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--coral)]" /> : null}</Link>;
          })}
        </nav>
        <p className="px-3 text-[0.68rem] leading-5 text-white/35">A-LSH · Votre espace de travail</p>
      </aside>

      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 px-2 pt-2 shadow-[0_-8px_28px_rgba(23,48,43,0.08)] backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileNavigation.map((item) => {
            const active = isActive(pathname, item.href);
            return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-semibold ${active ? "bg-[var(--mint-pale)] text-[var(--ink)]" : "text-[var(--muted)]"}`}><Icon name={item.icon} size={18} /><span>{item.shortLabel}</span></Link>;
          })}
          <button type="button" aria-expanded={menuOpen} aria-controls="mobile-module-menu" onClick={() => setMenuOpen((open) => !open)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-semibold ${menuOpen ? "bg-[var(--ink)] text-white" : "text-[var(--muted)]"}`}><Icon name="settings" size={18} /><span>Menu</span></button>
        </div>
      </nav>

      {menuOpen ? <div id="mobile-module-menu" className="fixed inset-x-3 bottom-24 z-50 max-h-[min(70vh,28rem)] overflow-auto rounded-3xl border border-[var(--line)] bg-white p-3 shadow-[0_18px_60px_rgba(23,48,43,0.2)] lg:hidden"><div className="flex items-center justify-between px-3 pb-2 pt-1"><p className="text-sm font-bold text-[var(--ink)]">Tous les modules</p><button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--mint-pale)]">Fermer</button></div><div className="grid grid-cols-2 gap-1">{navigation.filter((item) => !mobileNavigation.some((mobileItem) => mobileItem.href === item.href)).map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${isActive(pathname, item.href) ? "bg-[var(--mint-pale)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--background)]"}`}><Icon name={item.icon} size={18} /><span>{item.label}</span></Link>)}</div></div> : null}
    </>
  );
}
