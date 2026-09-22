import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceRole = "admin" | "director" | "animator" | "viewer";

export const roleLabels: Record<WorkspaceRole, string> = {
  admin: "Administrateur",
  director: "Direction",
  animator: "Animateur",
  viewer: "Lecteur",
};

export const getAuthContext = cache(async () => {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { user: null, profile: null, workspace: null, role: null };
  }

  const [{ data: profile }, { data: membership, error: membershipError }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userData.user.id).maybeSingle(),
    supabase
      .from("workspace_members")
      .select("workspace_id, role, created_at, workspaces(id, name)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (membershipError || !membership) {
    return {
      user: userData.user,
      profile,
      workspace: null,
      role: null,
    };
  }

  const workspace = Array.isArray(membership.workspaces)
    ? membership.workspaces[0]
    : membership.workspaces;

  if (!workspace || workspace.id !== membership.workspace_id) {
    return { user: userData.user, profile, workspace: null, role: null };
  }

  return {
    user: userData.user,
    profile,
    workspace,
    role: membership.role as WorkspaceRole,
  };
});

export async function requireWorkspaceContext() {
  const context = await getAuthContext();

  if (!context.user) {
    redirect("/connexion");
  }

  if (!context.workspace || !context.role) {
    redirect("/bienvenue");
  }

  return context as typeof context & {
    user: NonNullable<typeof context.user>;
    workspace: NonNullable<typeof context.workspace>;
    role: WorkspaceRole;
  };
}
