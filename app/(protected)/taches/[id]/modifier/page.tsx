import { notFound } from "next/navigation";
import { TaskForm } from "@/app/components/task-form";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import type { TaskRecord } from "@/lib/tasks/constants";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireWorkspaceContext();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("id, workspace_id, created_by, updated_by, title, description, category, priority, status, due_date, due_time, completed_at, visibility, is_pinned, created_at, updated_at").eq("id", id).eq("workspace_id", context.workspace.id).maybeSingle();
  if (!data) notFound();
  return <main className="mx-auto max-w-3xl space-y-6"><div><p className="eyebrow">Tâches</p><h1 className="page-title">Modifier la tâche</h1><p className="page-subtitle">Mettez à jour les informations de cette tâche privée.</p></div><TaskForm task={data as TaskRecord} /></main>;
}
