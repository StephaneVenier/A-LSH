import Link from "next/link";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { Icon } from "@/app/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getTodayIso, type TaskRecord } from "@/lib/tasks/constants";
import { TaskPreview } from "@/app/components/task-preview";

export default async function DashboardPage() {
  const context = await requireWorkspaceContext();
  const displayName = context.profile?.display_name?.trim() || context.user.user_metadata?.display_name || context.user.email?.split("@")[0] || "vous";
  const today = getTodayIso();
  const supabase = await createClient();
  const { data: taskData, error: taskError } = await supabase.from("tasks").select("id, workspace_id, created_by, updated_by, title, description, category, priority, status, due_date, due_time, completed_at, visibility, is_pinned, created_at, updated_at").eq("workspace_id", context.workspace.id).neq("status", "done").order("due_date", { ascending: true, nullsFirst: false }).order("due_time", { ascending: true, nullsFirst: false }).limit(20);
  const dashboardTasks = (taskData ?? []) as TaskRecord[];
  const overdueTasks = dashboardTasks.filter((task) => task.due_date && task.due_date < today);
  const todayTasks = dashboardTasks.filter((task) => task.due_date === today);

  const shortcuts = [
    { href: "/cahier", label: "Cahier", description: "Vos notes de travail", icon: "notebook" as const },
    { href: "/agenda", label: "Agenda", description: "Les temps à venir", icon: "calendar" as const },
    { href: "/taches", label: "Tâches", description: "Ce qu’il reste à faire", icon: "tasks" as const },
    { href: "/suivi-enfants", label: "Suivi enfants", description: "Les informations utiles", icon: "children" as const },
  ];

  return (
    <section className="animate-[fade-in_500ms_ease-out]">
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-7 shadow-[0_24px_80px_rgba(23,48,43,0.1)] sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral-dark)]">Tableau de bord</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-6xl">Bonjour {displayName}</h1>
            <p className="mt-4 text-sm font-medium capitalize text-[var(--muted)]">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date())}</p>
            <div className="mt-12 border-t border-[var(--line)] pt-8">
              <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral-dark)]">Aujourd’hui</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">Votre journée commence ici</h2></div><Link href="/taches" className="text-sm font-bold text-[var(--green)] hover:underline">Toutes les tâches →</Link></div>
              <div className="mt-6 rounded-3xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-[var(--ink)]">Tâches à suivre</h3><Link href="/taches/nouvelle" className="text-xs font-bold text-[var(--coral-dark)] hover:underline">Nouvelle tâche</Link></div>{taskError ? <p className="mt-4 text-sm text-[var(--ink-soft)]">Les tâches ne sont pas disponibles pour le moment.</p> : overdueTasks.length || todayTasks.length ? <div className="mt-4 space-y-4">{overdueTasks.length ? <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--coral-dark)]">En retard</p><div className="space-y-2">{overdueTasks.slice(0, 3).map((task) => <TaskPreview key={task.id} task={task} overdue />)}</div></div> : null}{todayTasks.length ? <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Dues aujourd’hui</p><div className="space-y-2">{todayTasks.slice(0, Math.max(0, 4 - Math.min(overdueTasks.length, 3))).map((task) => <TaskPreview key={task.id} task={task} />)}</div></div> : null}</div> : <p className="mt-4 text-sm text-[var(--ink-soft)]">Aucune tâche due aujourd’hui ou en retard.</p>}</div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {shortcuts.map((shortcut) => <Link key={shortcut.href} href={shortcut.href} className="group flex min-h-24 items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--background)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--mint)] hover:shadow-sm"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--ink-soft)]"><Icon name={shortcut.icon} /></span><span><span className="block font-semibold text-[var(--ink)]">{shortcut.label}</span><span className="mt-1 block text-xs text-[var(--muted)]">{shortcut.description}</span></span><span className="ml-auto text-[var(--muted)] transition group-hover:translate-x-1">→</span></Link>)}
              </div>
              <p className="mt-6 text-center text-xs text-[var(--muted)]">Les modules se construiront ici au fil de votre équipe.</p>
            </div>
            <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-[var(--mint-pale)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Votre espace de travail</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--ink)]">{context.workspace.name}</p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">Espace actif</span>
            </div>
            <p className="mt-8 text-sm leading-6 text-[var(--muted)]">Votre tableau de bord est prêt. Les premiers modules métier arriveront bientôt.</p>
      </div>
    </section>
  );
}
