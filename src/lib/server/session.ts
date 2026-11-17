import "server-only";

import { cache } from "react";
import type { User } from "@/features/auth/types";
import { backendRequest } from "@/lib/server/backend";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const response = await backendRequest("/auth/me");

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error("Unable to load your session. Please try again.");
  }

  const data = (await response.json()) as { user: User };

  return data.user;
});