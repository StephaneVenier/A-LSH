import Link from "next/link";
import { taskCategories, taskPriorities, taskPriorityLabels } from "@/lib/tasks/constants";

export function TaskFilters({ search, category, priority, view }: { search: string; category: string; priority: string; view: string }) {
  const active = Boolean(search || category || priority);
  return <form method="get" className="grid gap-3 rounded-3xl border border-[var(--line)] bg-white p-4 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-end">
    <input type="hidden" name="view" value={view} />
    <div><label htmlFor="task-search" className="field-label">Rechercher</label><input id="task-search" name="q" type="search" defaultValue={search} placeholder="Titre ou description" className="field-input" /></div>
    <div><label htmlFor="task-filter-category" className="field-label">Catégorie</label><select id="task-filter-category" name="category" defaultValue={category} className="field-input"><option value="">Toutes</option>{taskCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    <div><label htmlFor="task-filter-priority" className="field-label">Priorité</label><select id="task-filter-priority" name="priority" defaultValue={priority} className="field-input"><option value="">Toutes</option>{taskPriorities.map((item) => <option key={item} value={item}>{taskPriorityLabels[item]}</option>)}</select></div>
    <div className="flex gap-2"><button type="submit" className="min-h-12 flex-1 rounded-2xl bg-[var(--green)] px-4 text-sm font-bold text-white">Filtrer</button>{active ? <Link href={`/taches?view=${view}`} className="inline-flex min-h-12 items-center rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--ink)]">Effacer</Link> : null}</div>
  </form>;
}
