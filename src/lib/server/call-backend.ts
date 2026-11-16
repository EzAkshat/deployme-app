import "server-only";

import { backendRequest, type BackendOptions } from "@/lib/server/backend";
import type { ActionResult } from "@/lib/result";

interface CallOptions extends BackendOptions {
  /** Runs after a successful response, before the result is returned. */
  onSuccess?: (response: Response) => Promise<void>;
  /** Shown when the backend rejects the request without its own message. */
  failureMessage?: string;
  /** Shown when the backend is unreachable or onSuccess fails. */
  unavailableMessage?: string;
}

export async function callBackend<T>(
  path: string,
  { onSuccess, failureMessage, unavailableMessage, ...request }: CallOptions = {},
): Promise<ActionResult<T>> {
  try {
    const response = await backendRequest(path, request);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message:
          typeof data?.error?.message === "string"
            ? data.error.message
            : response.status === 429
              ? "Too many attempts. Please wait before trying again."
              : (failureMessage ??
                "Unable to complete this request. Please try again."),
      };
    }

    if (data === null) {
      return {
        ok: false,
        status: 502,
        message: "The backend returned an unexpected response.",
      };
    }

    await onSuccess?.(response);

    return { ok: true, data: data as T };
  } catch {
    return {
      ok: false,
      status: 503,
      message:
        unavailableMessage ??
        "Unable to complete the request. Please try again.",
    };
  }
}