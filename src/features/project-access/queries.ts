import "server-only";

import { readBackend } from "@/lib/server/read-backend";
import type { ProjectAccessData } from "./types";

export function getProjectAccess(projectId: string) {
  return readBackend<ProjectAccessData>(
    `/projects/${encodeURIComponent(projectId)}/access`,
  );
}