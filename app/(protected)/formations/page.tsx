import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function TrainingPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Formations" description="Suivez les ressources et les temps de montée en compétences de l’équipe." icon="training" />;
}
