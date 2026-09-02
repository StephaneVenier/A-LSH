import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white/90 shadow-[0_24px_80px_rgba(23,48,43,0.13)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-[var(--ink)] px-7 py-9 text-white sm:px-10 sm:py-12 lg:min-h-[650px]">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--mint)]/25 blur-2xl" />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[var(--coral)]/25 blur-3xl" />
          <Link href="/" className="relative inline-flex items-center gap-2 text-lg font-black tracking-[-0.04em]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--coral)] text-sm text-white">A</span>
            A-LSH
          </Link>
          <div className="relative mt-20 max-w-sm lg:mt-32">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--mint-light)]">L’outil qui rassemble</p>
            <p className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Organisez vos accueils avec plus de sérénité.
            </p>
            <p className="mt-5 text-sm leading-7 text-white/65">
              Un espace simple pour faire circuler les bonnes informations, au bon moment.
            </p>
          </div>
        </div>
        <div className="px-7 py-9 sm:px-12 sm:py-14">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink)] sm:text-4xl">{title}</h1>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-7 border-t border-[var(--line)] pt-6 text-center text-sm text-[var(--muted)]">{footer}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
