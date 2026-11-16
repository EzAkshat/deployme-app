"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendRequest } from "@/lib/server/backend";
import type { ManualDeploymentState } from "./types";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export async function requestManualDeployment(
  projectId: string,
  _previous: ManualDeploymentState,
  _formData: FormData,
): Promise<ManualDeploymentState> {
  void _previous;
  void _formData;

  if (!ID_PATTERN.test(projectId)) {
    return { message: "Invalid project.", uncertain: false };
  }

  let response: Response;

  try {
    response = await backendRequest(
      `/projects/${encodeURIComponent(projectId)}/deployments`,
      { method: "POST" },
    );
  } catch {
    return {
      message:
        "Could not confirm the request. Check the latest deployments before trying again; a deployment may have started.",
      uncertain: true,
    };
  }

  if (!response.ok) {
    if (response.status === 401) {
      return {
        message: "Your session expired. Sign in again.",
        uncertain: false,
      };
    }

    if (response.status === 403 || response.status === 404) {
      return {
        message:
          "This project is unavailable or you do not have deployment permission. Team owners and managers also need an explicit Deploy grant.",
        uncertain: false,
      };
    }

    if (response.status === 429) {
      return {
        message:
          "The deployment limit has been reached. Wait for an active deployment to finish before trying again.",
        uncertain: false,
      };
    }

    return {
      message:
        "Unable to confirm deployment. Check the latest deployments and repository connection before retrying.",
      uncertain: true,
    };
  }

  const result = await response.json().catch(() => null);
  const deploymentId: unknown = result?.deployment?.id;

  revalidatePath(`/projects/${projectId}`);

  if (typeof deploymentId !== "string" || !ID_PATTERN.test(deploymentId)) {
    return {
      message:
        "The request was accepted, but its deployment details could not be read. Check the latest deployments before trying again.",
      uncertain: true,
    };
  }

  // Keep redirect outside the request's try/catch.
  redirect(
    `/projects/${encodeURIComponent(projectId)}?deployment=${encodeURIComponent(deploymentId)}`,
  );
}