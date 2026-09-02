import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function TasksPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Tâches" description="Coordonnez les prochaines actions importantes de votre équipe." icon="tasks" />;
}
