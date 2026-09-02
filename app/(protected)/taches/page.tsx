import Link from "next/link";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { getTodayIso, isTaskCategory, isTaskPriority, type TaskRecord } from "@/lib/tasks/constants";
import { TaskCard } from "@/app/components/task-card";
import { TaskFilters } from "@/app/components/task-filters";

const views = [["today", "Aujourd’hui"], ["upcoming", "À venir"], ["undated", "Sans date"], ["completed", "Terminées"]] as const;

function Notice({ value }: { value?: string }) {
  if (!value) return null;
  const messages: Record<string, string> = { created: "La tâche a été créée.", updated: "La tâche a été mise à jour.", deleted: "La tâche a été supprimée définitivement.", delete: "La tâche n’a pas pu être supprimée.", update: "La tâche n’a pas pu être mise à jour." };
  const isError = value === "delete" || value === "update";
  return <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${isError ? "bg-[#fff0eb] text-[var(--coral-dark)]" : "bg-[var(--mint-pale)] text-[var(--green)]"}`} role="status">{messages[value] ?? "Une erreur est survenue."}</p>;
}

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireWorkspaceContext();
  const params = await searchParams;
  const view = typeof params.view === "string" && views.some(([key]) => key === params.view) ? params.view : "today";
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const category = typeof params.category === "string" && isTaskCategory(params.category) ? params.category : "";
  const priority = typeof params.priority === "string" && isTaskPriority(params.priority) ? params.priority : "";
  const supabase = await createClient();
  let query = supabase.from("tasks").select("id, workspace_id, created_by, updated_by, title, description, category, priority, status, due_date, due_time, completed_at, visibility, is_pinned, created_at, updated_at").eq("workspace_id", context.workspace.id).order("is_pinned", { ascending: false }).order("due_date", { ascending: true, nullsFirst: false }).order("due_time", { ascending: true, nullsFirst: false });
  if (search) query = query.textSearch("search_vector", search, { config: "french", type: "websearch" });
  if (category) query = query.eq("category", category);
  if (priority) query = query.eq("priority", priority);
  const { data, error } = await query;
  const tasks = (data ?? []) as TaskRecord[];
  const today = getTodayIso();
  const active = tasks.filter((task) => task.status !== "done");
  const overdue = active.filter((task) => task.due_date && task.due_date < today);
  const dueToday = active.filter((task) => task.due_date === today);
  const upcoming = active.filter((task) => task.due_date && task.due_date > today);
  const undated = active.filter((task) => !task.due_date);
  const completed = tasks.filter((task) => task.status === "done");
  const current = view === "upcoming" ? upcoming : view === "undated" ? undated : view === "completed" ? completed : [...overdue, ...dueToday];
  const emptyLabel = view === "today" ? "Aucune tâche due aujourd’hui ou en retard." : view === "upcoming" ? "Aucune tâche à venir." : view === "undated" ? "Aucune tâche sans date." : "Aucune tâche terminée.";

  return <main className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Organisation</p><h1 className="page-title">Tâches</h1><p className="page-subtitle">Gardez le fil des actions à faire, sans perdre de vue les urgences.</p></div><Link href="/taches/nouvelle" className="button-primary">Nouvelle tâche</Link></div>
    <Notice value={typeof params.created === "string" ? "created" : typeof params.updated === "string" ? "updated" : typeof params.deleted === "string" ? "deleted" : typeof params.error === "string" ? params.error : undefined} />
    {error ? <p className="form-error" role="alert">Les tâches ne sont pas disponibles pour le moment.</p> : null}
    <nav aria-label="Vues des tâches" className="flex max-w-full gap-2 overflow-x-auto pb-1">{views.map(([key, label]) => <Link key={key} href={`/taches?view=${key}${search ? `&q=${encodeURIComponent(search)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}${priority ? `&priority=${priority}` : ""}`} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold ${view === key ? "bg-[var(--green)] text-white" : "bg-white text-[var(--ink-soft)] ring-1 ring-[var(--line)]"}`}>{label}</Link>)}</nav>
    <TaskFilters search={search} category={category} priority={priority} view={view} />
    {view === "today" && overdue.length ? <section className="space-y-3"><h2 className="section-title text-[var(--coral-dark)]">En retard</h2><div className="grid gap-3">{overdue.map((task) => <TaskCard key={task.id} task={task} todayIso={today} />)}</div></section> : null}
    {view === "today" && dueToday.length ? <section className="space-y-3"><h2 className="section-title">Aujourd’hui</h2><div className="grid gap-3">{dueToday.map((task) => <TaskCard key={task.id} task={task} todayIso={today} />)}</div></section> : null}
    {current.length === 0 ? <section className="empty-state"><h2 className="text-lg font-bold text-[var(--ink)]">{search || category || priority ? "Aucun résultat" : emptyLabel}</h2><p>{search || category || priority ? "Essayez une autre recherche ou modifiez vos filtres." : "Les tâches que vous créerez apparaîtront ici."}</p></section> : null}
    {view !== "today" && current.length ? <section className="grid gap-3">{current.map((task) => <TaskCard key={task.id} task={task} todayIso={today} />)}</section> : null}
  </main>;
}
