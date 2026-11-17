import "server-only";
import { getRequestSite } from "@/lib/server/request-site";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

export interface BackendOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  timeoutMs?: number;
}

export async function backendRequest(
  path: string,
  options: BackendOptions = {},
): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL must be configured.");
  }

  const site = await getRequestSite();

  const base = new URL(backendUrl);
  const destination = new URL(path, base);

  // Requests must remain on our configured backend.
  if (!path.startsWith("/") || destination.origin !== base.origin) {
    throw new Error("Invalid backend request path.");
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  const headers = new Headers({
    Accept: "application/json",
    Origin: site.origin,
  });

  if (session) {
    headers.set(
      "Cookie",
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(session.value)}`,
    );
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  return fetch(destination, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
  });
}
