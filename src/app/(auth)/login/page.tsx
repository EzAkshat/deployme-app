import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthCardSkeleton } from "@/features/auth/components/auth-card";
import { AuthFlow } from "@/features/auth/components/auth-flow";
import { homePathFor } from "@/features/auth/paths";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Sign in" };

async function LoginContent() {
  const user = await getCurrentUser();

  if (user) redirect(homePathFor(user));

  return <AuthFlow initialScreen="email" />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}