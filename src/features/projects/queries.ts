import "server-only";

import { redirect } from "next/navigation";
import { backendRequest } from "@/lib/server/backend";
import { getBackendJson } from "@/lib/server/backend-json";
import type { DeploymentOverview, Project } from "./types";

export async function getPersonalProjects(): Promise<Project[]> {
  const data = await getBackendJson<{ projects: Project[] }>(
    "/projects/personal",
    "Unable to load your projects. Please try again.",
  );

  return data.projects;
}

/** Returns null when history cannot be loaded, so the page stays usable. */
export async function getDeploymentOverview(
  projectId: string,
): Promise<DeploymentOverview | null> {
  let response: Response;

  try {
    response = await backendRequest(
      `/projects/${encodeURIComponent(projectId)}/overview`,
    );
  } catch {
    return null;
  }

  if (response.status === 401) redirect("/login");
  if (!response.ok) return null;

  const data = (await response.json().catch(() => null)) as {
    overview?: DeploymentOverview;
  } | null;

  return data?.overview ?? null;
}