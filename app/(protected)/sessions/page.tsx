import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function SessionsPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Sessions & vacances" description="Préparez les périodes d’accueil et leurs repères d’organisation." icon="sun" />;
}
