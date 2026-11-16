import "server-only";

import { redirect } from "next/navigation";
import { backendRequest } from "@/lib/server/backend";

/**
 * Reads JSON from the backend for a page.
 * 401 sends the person to sign in; any other failure throws to the
 * nearest error boundary.
 */
export async function getBackendJson<T>(
  path: string,
  failureMessage: string,
): Promise<T> {
  const response = await backendRequest(path);

  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error(failureMessage);

  return (await response.json()) as T;
}