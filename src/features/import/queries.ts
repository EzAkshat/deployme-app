import "server-only";

import type { GitHubConnection } from "@/features/github/types";
import { readBackend } from "@/lib/server/read-backend";
import type { InstallationList, RepositoryList } from "./types";

export function readGitHubConnection() {
  return readBackend<{ connection: GitHubConnection }>(
    "/integrations/github/connection",
  );
}

export function getInstallations(page: number) {
  return readBackend<InstallationList>(
    `/integrations/github/installations?page=${page}`,
  );
}

export function getRepositories(installationId: number, page: number) {
  return readBackend<RepositoryList>(
    `/integrations/github/installations/${installationId}/repositories?page=${page}`,
  );
}