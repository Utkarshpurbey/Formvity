import { Suspense } from "react";
import { AuthShell } from "@/src/components/layout/AuthShell";
import { PageLoader } from "@/src/components/ui/index";
import { safeRedirectPath } from "@/src/lib/auth/serverLogin";
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams?: { redirect?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = safeRedirectPath(searchParams?.redirect);

  return (
    <AuthShell
      badge="Sign in"
      title="Access your Formvity workspace"
      subtitle="Sign in to build, publish, and manage forms from one dashboard."
    >
      <Suspense fallback={<PageLoader message="Loading…" className="min-h-[320px]" />}>
        <LoginForm redirectTo={redirectTo} />
      </Suspense>
    </AuthShell>
  );
}
