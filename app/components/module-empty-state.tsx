import { Icon } from "./icons";

type ModuleEmptyStateProps = {
  title: string;
  description: string;
  icon: Parameters<typeof Icon>[0]["name"];
};

export function ModuleEmptyState({ title, description, icon }: ModuleEmptyStateProps) {
  return (
    <section className="animate-[fade-in_500ms_ease-out]">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">A-LSH · Module</p>
      <div className="mt-4 flex items-start gap-4 sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--mint-pale)] text-[var(--ink-soft)]"><Icon name={icon} size={22} /></div>
        <div><h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">{description}</p></div>
      </div>
      <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-[2rem] border border-dashed border-[var(--line)] bg-white/55 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--mint)] shadow-sm"><Icon name={icon} size={24} /></div>
        <h2 className="mt-5 text-lg font-semibold text-[var(--ink)]">Rien à afficher pour le moment</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">Cet espace accueillera bientôt vos informations. Le module est en cours de construction.</p>
      </div>
    </section>
  );
}
