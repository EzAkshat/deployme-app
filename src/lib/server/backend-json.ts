import "server-only";

import { notFound, redirect } from "next/navigation";
import { backendRequest } from "@/lib/server/backend";

interface Options {
  /** Statuses that mean "this page doesn't exist for this person". */
  notFoundOn?: readonly number[];
}

/**
 * Reads JSON from the backend for a page.
 * 401 sends the person to sign in; listed statuses become a 404;
 * any other failure throws to the nearest error boundary.
 */
export async function getBackendJson<T>(
  path: string,
  failureMessage: string,
  { notFoundOn = [] }: Options = {},
): Promise<T> {
  const response = await backendRequest(path);

  if (response.status === 401) redirect("/login");
  if (notFoundOn.includes(response.status)) notFound();
  if (!response.ok) throw new Error(failureMessage);

  return (await response.json()) as T;
}