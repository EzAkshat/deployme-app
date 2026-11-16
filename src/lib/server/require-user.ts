import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@/features/auth/types";
import { getCurrentUser } from "@/lib/server/session";

/** For authenticated pages: sign-in and onboarding redirects in one place. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.onboardingCompletedAt === null) redirect("/onboarding");

  return user;
}