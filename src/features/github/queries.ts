import "server-only";

import { getBackendJson } from "@/lib/server/backend-json";
import type { GitHubConnection } from "./types";

export async function getGitHubConnection(): Promise<GitHubConnection> {
  const data = await getBackendJson<{ connection: GitHubConnection }>(
    "/integrations/github/connection",
    "Unable to load your GitHub connection. Please try again.",
  );

  return data.connection;
}