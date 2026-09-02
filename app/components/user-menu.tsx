import { signOut } from "@/app/actions/auth";
import { roleLabels, type WorkspaceRole } from "@/lib/auth/context";

export function UserMenu({ displayName, email, role }: { displayName: string; email: string; role: WorkspaceRole }) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <details className="relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--mint-pale)] [&::-webkit-details-marker]:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-bold text-white">{initial}</span>
        <span className="hidden text-left sm:block"><span className="block max-w-36 truncate text-sm font-semibold text-[var(--ink)]">{displayName}</span><span className="block text-xs text-[var(--muted)]">{roleLabels[role]}</span></span>
        <span className="text-[var(--muted)]"><span className="sr-only">Ouvrir le menu utilisateur</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></span>
      </summary>
      <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[0_18px_50px_rgba(23,48,43,0.16)]">
        <div className="border-b border-[var(--line)] px-3 py-2"><p className="truncate text-sm font-semibold text-[var(--ink)]">{displayName}</p><p className="truncate text-xs text-[var(--muted)]">{email}</p></div>
        <p className="px-3 py-2 text-xs font-semibold text-[var(--muted)]">{roleLabels[role]}</p>
        <form action={signOut}><button type="submit" className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--coral-dark)] hover:bg-[#fff0ed]">Se déconnecter</button></form>
      </div>
    </details>
  );
}
