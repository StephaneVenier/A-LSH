import { TaskForm } from "@/app/components/task-form";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function NewTaskPage() {
  await requireWorkspaceContext();
  return <main className="mx-auto max-w-3xl space-y-6"><div><p className="eyebrow">Tâches</p><h1 className="page-title">Nouvelle tâche</h1><p className="page-subtitle">Ajoutez une action à votre espace de travail.</p></div><TaskForm /></main>;
}
