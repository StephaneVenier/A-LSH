import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null, applicationOrigin: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return "/";
  }

  try {
    const destination = new URL(value, applicationOrigin);
    return destination.origin === applicationOrigin
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : "/";
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = safeNextPath(url.searchParams.get("next"), url.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/connexion?error=confirmation", url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/connexion?error=confirmation", url));
  }

  return NextResponse.redirect(new URL(nextPath, url));
}
