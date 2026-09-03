import { notFound } from "next/navigation";
import { EventForm } from "@/app/components/event-form";
import { DeleteEventForm } from "@/app/components/delete-event-form";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import type { EventRecord } from "@/lib/agenda/constants";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireWorkspaceContext();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("id, workspace_id, created_by, updated_by, title, description, location, category, color, start_date, start_time, end_date, end_time, is_all_day, visibility, created_at, updated_at").eq("id", id).eq("workspace_id", context.workspace.id).maybeSingle();
  if (!data) notFound();
  return <main className="mx-auto max-w-3xl space-y-6"><div><p className="eyebrow">Agenda</p><h1 className="page-title">Modifier l’événement</h1><p className="page-subtitle">Mettez à jour les informations de cet événement privé.</p></div><EventForm event={data as EventRecord} /><div className="border-t border-[var(--line)] pt-6"><p className="mb-3 text-sm text-[var(--muted)]">La suppression est définitive et ne peut pas être annulée.</p><DeleteEventForm id={id} /></div></main>;
}
