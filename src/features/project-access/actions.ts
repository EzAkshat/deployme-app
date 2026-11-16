"use server";

import { revalidatePath } from "next/cache";
import { ID_PATTERN } from "@/lib/ids";
import { backendRequest } from "@/lib/server/backend";
import type { ProjectAccessState } from "./types";

export async function updateProjectAccess(
  projectId: string,
  _previous: ProjectAccessState,
  formData: FormData,
): Promise<ProjectAccessState> {
  if (!ID_PATTERN.test(projectId)) {
    return { ok: false, message: "Invalid project." };
  }

  const rawUserId = formData.get("userId");
  const operation = formData.get("operation");

  if (
    typeof rawUserId !== "string" ||
    !/^[1-9]\d*$/.test(rawUserId) ||
    !Number.isSafeInteger(Number(rawUserId))
  ) {
    return { ok: false, message: "Choose a valid team member." };
  }

  if (operation !== "save" && operation !== "revoke") {
    return { ok: false, message: "Unsupported access action." };
  }

  const base = `/projects/${encodeURIComponent(projectId)}/shares`;
  let response: Response;

  try {
    response =
      operation === "revoke"
        ? await backendRequest(`${base}/${rawUserId}`, { method: "DELETE" })
        : await backendRequest(base, {
            method: "PUT",
            body: {
              userId: Number(rawUserId),
              canView: formData.get("canView") === "on",
              canDeploy: formData.get("canDeploy") === "on",
              canManage: formData.get("canManage") === "on",
            },
          });
  } catch {
    return {
      ok: false,
      message:
        "Could not confirm the result. Refresh before retrying; the change may have completed.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message:
        response.status === 401
          ? "Your session expired. Sign in again."
          : response.status === 403 || response.status === 404
            ? "Access or membership may have changed. Refresh the page."
            : "Unable to update project access. Please retry.",
    };
  }

  revalidatePath(`/projects/${projectId}/access`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath("/teams", "layout");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message:
      operation === "revoke"
        ? "Explicit grants removed. Owners and managers retain role-based viewing and management access."
        : "Project permissions saved.",
  };
}