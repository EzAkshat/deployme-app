import "server-only";

import { readBackend } from "@/lib/server/read-backend";
import type { ProjectSettings } from "./types";

export function getProjectSettings(projectId: string) {
  return readBackend<{ project: ProjectSettings }>(
    `/projects/${encodeURIComponent(projectId)}/settings`,
  );
}