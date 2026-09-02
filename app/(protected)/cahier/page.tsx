import { ModuleEmptyState } from "@/app/components/module-empty-state";
import { requireWorkspaceContext } from "@/lib/auth/context";

export default async function CahierPage() {
  await requireWorkspaceContext();
  return <ModuleEmptyState title="Cahier de travail" description="Retrouvez vos notes, repères et transmissions au même endroit." icon="notebook" />;
}
