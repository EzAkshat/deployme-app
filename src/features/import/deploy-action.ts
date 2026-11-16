"use server";

import { callBackend } from "@/lib/server/call-backend";
import type { DeployProjectInput, DeployProjectResult } from "./types";

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export async function deployProjectAction(
  input: DeployProjectInput,
  idempotencyKey: string,
): Promise<DeployProjectResult> {
  if (
    typeof idempotencyKey !== "string" ||
    !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)
  ) {
    return {
      ok: false,
      message:
        "Invalid deployment request. Reload the page before trying again.",
      uncertain: false,
    };
  }

  // Express validates the complete input and authenticates the session.
  const result = await callBackend<{
    project: { id: string; name: string };
    deployment: { id: string; status: string };
  }>("/projects/import", {
    method: "POST",
    body: input,
    idempotencyKey,
    timeoutMs: 90_000,
    failureMessage: "Unable to start this deployment.",
    unavailableMessage:
      "DeployMe could not confirm the result. Retry this request without changing its settings.",
  });

  if (!result.ok) {
    return {
      ok: false,
      message:
        result.status === 401
          ? "Your session expired. Sign in again before deploying."
          : result.message,
      uncertain: result.status >= 500,
    };
  }

  const { project, deployment } = result.data;

  if (!project?.id || !deployment?.id) {
    return {
      ok: false,
      message:
        "The response was incomplete. Retry the same request to check its result.",
      uncertain: true,
    };
  }

  return { ok: true, project, deployment };
}