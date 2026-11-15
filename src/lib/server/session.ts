import "server-only";

import { backendRequest } from "@/lib/server/backend";
import type { User } from "@/features/auth/types";

export async function getCurrentUser(): Promise<User | null> {
  const response = await backendRequest("/auth/me");

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error("Unable to load your session. Please try again.");
  }

  const data = (await response.json()) as { user: User };
  return data.user;
}