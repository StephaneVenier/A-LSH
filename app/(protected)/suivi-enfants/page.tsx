import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function ChildrenPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Suivi enfants" description="Centralisez bientôt les informations utiles au suivi des enfants accueillis." icon="children" />;
}
