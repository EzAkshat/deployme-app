import type { User } from "./types";

export function homePathFor(user: User): "/onboarding" | "/dashboard" {
  return user.onboardingCompletedAt === null ? "/onboarding" : "/dashboard";
}