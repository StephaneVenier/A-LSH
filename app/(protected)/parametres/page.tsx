import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function SettingsPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Paramètres" description="Gérez bientôt les préférences de votre espace et de votre équipe." icon="settings" />;
}
