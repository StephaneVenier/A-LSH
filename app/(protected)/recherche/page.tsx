import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function SearchPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Recherche" description="Retrouvez bientôt rapidement les informations de votre espace." icon="search" />;
}
