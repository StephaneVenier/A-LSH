import Link from "next/link";
import { AuthShell } from "@/app/components/auth-shell";
import { LoginForm } from "@/app/components/login-form";

const callbackErrors: Record<string, string> = {
  confirmation: "Le lien de confirmation est invalide ou a expiré. Demandez un nouvel e-mail d’invitation.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Votre espace de travail"
      title="Ravi de vous revoir"
      description="Connectez-vous pour retrouver vos espaces et continuer à faire avancer vos accueils."
      footer={<span>Besoin d’aide ? <Link href="mailto:bonjour@a-lsh.fr" className="font-semibold text-[var(--coral-dark)] hover:underline">Écrivez-nous</Link></span>}
    >
      <LoginForm initialError={params.error ? callbackErrors[params.error] : undefined} />
    </AuthShell>
  );
}
