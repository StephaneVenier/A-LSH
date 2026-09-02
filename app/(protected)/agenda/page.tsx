import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function AgendaPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Agenda" description="Visualisez bientôt les temps forts et les rendez-vous de votre équipe." icon="calendar" />;
}
