import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import { RegisterForm } from "@/components/auth/register-form";
import { AppShell } from "@/components/layout/app-shell";

export default function RegisterPage() {
  return (
    <AuthRedirectGuard>
      <AppShell>
        <section className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-10">
          <RegisterForm />
        </section>
      </AppShell>
    </AuthRedirectGuard>
  );
}
