import "server-only";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/result";
import { callBackend } from "@/lib/server/call-backend";

export async function readBackend<T>(
  path: string,
  { timeoutMs }: { timeoutMs?: number } = {},
): Promise<ActionResult<T>> {
  const result = await callBackend<T>(path, {
    timeoutMs,
    unavailableMessage: "Unable to reach DeployMe. Please retry.",
  });

  if (!result.ok && result.status === 401) redirect("/login");

  return result;
}