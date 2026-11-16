"use server";

import { callBackend } from "@/lib/server/call-backend";
import type { GitHubInspection, InspectionState } from "./types";

const OWNER_PATTERN = /^[A-Za-z0-9_-]{1,255}$/;
const REPOSITORY_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,100}$/;

export async function inspectRepositoryAction(
  installationId: number,
  _previousState: InspectionState,
  formData: FormData,
): Promise<InspectionState> {
  const repositoryId = Number(formData.get("repositoryId"));
  const owner = formData.get("owner");
  const name = formData.get("name");
  const rootDirectory = formData.get("rootDirectory");

  if (
    !Number.isSafeInteger(installationId) ||
    installationId <= 0 ||
    !Number.isSafeInteger(repositoryId) ||
    repositoryId <= 0 ||
    typeof owner !== "string" ||
    !OWNER_PATTERN.test(owner) ||
    typeof name !== "string" ||
    !REPOSITORY_NAME_PATTERN.test(name) ||
    name === "." ||
    name === ".." ||
    typeof rootDirectory !== "string" ||
    rootDirectory.trim().length === 0 ||
    rootDirectory.trim().length > 255
  ) {
    return {
      error: "Choose a repository and provide a valid app folder.",
      inspection: null,
    };
  }

  const result = await callBackend<{ inspection: GitHubInspection }>(
    "/integrations/github/inspect",
    {
      method: "POST",
      body: {
        installationId,
        repositoryId,
        owner,
        name,
        rootDirectory: rootDirectory.trim(),
      },
      timeoutMs: 60_000,
      failureMessage: "Unable to inspect this repository.",
      unavailableMessage:
        "Unable to reach the inspection service. Please try again.",
    },
  );

  if (!result.ok) {
    return {
      error:
        result.status === 401
          ? "Your session has expired. Return to the dashboard to sign in."
          : result.message,
      inspection: null,
    };
  }

  return { error: "", inspection: result.data.inspection };
}