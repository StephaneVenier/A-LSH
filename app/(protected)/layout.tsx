import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { getAuthContext, type WorkspaceRole } from "@/lib/auth/context";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  const context = await getAuthContext();

  if (!context.user) {
    redirect("/connexion");
  }

  const displayName =
    context.profile?.display_name?.trim() ||
    context.user.user_metadata?.display_name ||
    context.user.email?.split("@")[0] ||
    "vous";

  return (
    <AppShell
      displayName={displayName}
      email={context.user.email ?? ""}
      workspaceName={context.workspace?.name ?? "Votre espace de travail"}
      role={(context.role ?? "viewer") as WorkspaceRole}
    >
      {children}
    </AppShell>
  );
}
