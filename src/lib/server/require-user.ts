import "server-only";

import { notFound, redirect } from "next/navigation";
import type { User } from "@/features/auth/types";
import { isAdministrator } from "@/features/auth/roles";
import { getCurrentUser } from "@/lib/server/session";
import { getRequestSite } from "@/lib/server/request-site";

export async function requireUser(): Promise<User> {
  const site = await getRequestSite();
  const user = await getCurrentUser();

  if (!user) {
    redirect(site.isAdmin ? "/" : "/login");
  }

  if (site.isAdmin) {
    if (!isAdministrator(user)) {
      notFound();
    }

    return user;
  }

  if (user.onboardingCompletedAt === null) {
    redirect("/onboarding");
  }

  return user;
}