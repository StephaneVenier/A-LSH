import { AuthShell } from "@/app/components/auth-shell";
import { SignupForm } from "@/app/components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Première étape"
      title="Créez votre compte"
      description="Quelques informations suffisent pour commencer à organiser votre espace de travail."
      footer="En créant votre compte, vous rejoignez un espace de travail sécurisé."
    >
      <SignupForm />
    </AuthShell>
  );
}
