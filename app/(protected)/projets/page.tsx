import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function ProjectsPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Projets" description="Faites grandir les idées et les projets de votre structure." icon="projects" />;
}
