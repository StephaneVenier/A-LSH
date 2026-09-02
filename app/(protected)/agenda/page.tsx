import Link from "next/link";
import { AgendaView } from "@/app/components/agenda-view";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { agendaViews, getAgendaRange, isIsoDate, type AgendaTask, type AgendaView as AgendaViewType, type EventRecord } from "@/lib/agenda/constants";

function notice(value?: string) {
  const messages: Record<string, string> = { created: "L’événement a été créé.", updated: "L’événement a été mis à jour.", deleted: "L’événement a été supprimé définitivement.", delete: "L’événement n’a pas pu être supprimé." };
  return value ? messages[value] ?? "Une erreur est survenue." : null;
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const context = await requireWorkspaceContext();
  const params = await searchParams;
  const requestedDate = typeof params.date === "string" && isIsoDate(params.date) ? params.date : new Intl.DateTimeFormat("fr-CA").format(new Date());
  const view: AgendaViewType = typeof params.vue === "string" && agendaViews.includes(params.vue as AgendaViewType) ? params.vue as AgendaViewType : "mois";
  const range = getAgendaRange(requestedDate, view);
  const supabase = await createClient();
  const [eventResult, taskResult] = await Promise.all([
    supabase.from("events").select("id, workspace_id, created_by, updated_by, title, description, location, category, color, start_date, start_time, end_date, end_time, is_all_day, visibility, created_at, updated_at").eq("workspace_id", context.workspace.id).lte("start_date", range.end).gte("end_date", range.start).order("start_date").order("start_time", { ascending: true, nullsFirst: true }),
    supabase.from("tasks").select("id, title, due_date, due_time, status, priority, is_pinned").eq("workspace_id", context.workspace.id).gte("due_date", range.start).lte("due_date", range.end).order("due_date").order("due_time", { ascending: true, nullsFirst: true }),
  ]);
  const events = (eventResult.data ?? []) as EventRecord[];
  const tasks = (taskResult.data ?? []) as AgendaTask[];
  const message = notice(typeof params.created === "string" ? "created" : typeof params.updated === "string" ? "updated" : typeof params.deleted === "string" ? "deleted" : typeof params.error === "string" ? params.error : undefined);

  return <main className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Organisation</p><h1 className="page-title">Agenda</h1><p className="page-subtitle">Visualisez vos événements et vos tâches datées, sans mélanger leurs usages.</p></div><Link href="/agenda/nouvel-evenement" className="agenda-primary-button w-full sm:w-auto">Nouvel événement</Link></div>{message ? <p className="rounded-2xl bg-[var(--mint-pale)] px-4 py-3 text-sm font-semibold text-[var(--green)]" role="status">{message}</p> : null}{eventResult.error || taskResult.error ? <p className="form-error" role="alert">Une partie de l’agenda n’est pas disponible pour le moment.</p> : null}<AgendaView date={requestedDate} view={view} events={events} tasks={tasks} /></main>;
}
