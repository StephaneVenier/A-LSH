import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextUrl(value: string | null, applicationOrigin: string) {
  const fallback = new URL("/", applicationOrigin);
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback;
  }

  try {
    const destination = new URL(value, applicationOrigin);
    return destination.origin === applicationOrigin && !destination.pathname.startsWith("//")
      ? destination
      : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = safeNextUrl(url.searchParams.get("next"), url.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/connexion?error=confirmation", url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/connexion?error=confirmation", url));
  }

  return NextResponse.redirect(destination);
}
