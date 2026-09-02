import { EventForm } from "@/app/components/event-form";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { isIsoDate } from "@/lib/agenda/constants";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireWorkspaceContext();
  const params = await searchParams;
  const date = typeof params.date === "string" && isIsoDate(params.date) ? params.date : undefined;
  const time = typeof params.heure === "string" && /^\d{2}:\d{2}$/.test(params.heure) ? params.heure : undefined;
  return <main className="mx-auto max-w-3xl space-y-6"><div><p className="eyebrow">Agenda</p><h1 className="page-title">Nouvel événement</h1><p className="page-subtitle">Planifiez un temps important de votre espace.</p></div><EventForm initialDate={date} initialTime={time} /></main>;
}
