"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "./auth";

export async function createWorkspace(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Saisissez le nom de votre espace de travail." };
  }

  if (name.length > 120) {
    return { error: "Le nom de l’espace ne peut pas dépasser 120 caractères." };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/connexion");
  }

  const { data: ownedWorkspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("created_by", userData.user.id)
    .limit(1);

  if (workspaceError) {
    return {
      error: "Impossible de vérifier votre espace. Réessayez dans un instant.",
    };
  }

  if (ownedWorkspace.length > 0) {
    redirect("/tableau-de-bord");
  }

  const { error } = await supabase.rpc("create_workspace", {
    workspace_name: name,
  });

  if (error?.code === "23505") {
    return {
      error: "Vous possédez déjà un espace de travail.",
    };
  }

  if (error) {
    return {
      error: "La création de l’espace a échoué. Vérifiez le nom puis réessayez.",
    };
  }

  redirect("/tableau-de-bord");
}
