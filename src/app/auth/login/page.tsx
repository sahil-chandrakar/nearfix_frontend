import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import { LoginForm } from "@/components/auth/login-form";
import { AppShell } from "@/components/layout/app-shell";

export default function LoginPage() {
  return (
    <AuthRedirectGuard>
      <AppShell>
        <section className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-10">
          <LoginForm />
        </section>
      </AppShell>
    </AuthRedirectGuard>
  );
}
