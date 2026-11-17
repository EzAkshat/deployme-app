import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthCardSkeleton } from "@/features/auth/components/auth-card";
import { AuthFlow } from "@/features/auth/components/auth-flow";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { homePathFor } from "@/features/auth/paths";
import { isAdministrator } from "@/features/auth/roles";
import { getCurrentUser } from "@/lib/server/session";
import { getRequestSite } from "@/lib/server/request-site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

async function LoginContent() {
  const site = await getRequestSite();
  const user = await getCurrentUser();

  if (user) {
    if (!site.isAdmin) {
      redirect(homePathFor(user));
    }

    if (isAdministrator(user)) {
      redirect("/dashboard");
    }

    return (
      <section className="space-y-4">
        <h1 className="text-xl font-semibold">
          Administrator access required
        </h1>
        <p className="text-sm text-muted-foreground">
          This account does not have administrator access.
          Sign out to use a different account.
        </p>
        <SignOutButton />
      </section>
    );
  }

  return (
    <AuthFlow
      initialScreen="email"
      admin={site.isAdmin}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}