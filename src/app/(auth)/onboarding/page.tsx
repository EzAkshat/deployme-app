import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthCardSkeleton } from "@/features/auth/components/auth-card";
import { AuthFlow } from "@/features/auth/components/auth-flow";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Welcome" };

async function OnboardingContent() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.onboardingCompletedAt !== null) redirect("/dashboard");

  return <AuthFlow initialScreen="onboarding" initialEmail={user.email} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <OnboardingContent />
    </Suspense>
  );
}