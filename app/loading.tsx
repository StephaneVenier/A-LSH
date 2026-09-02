export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--coral)]" />
        Chargement de votre espace…
      </div>
    </main>
  );
}
