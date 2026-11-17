"use server";

import { revalidatePath } from "next/cache";
import { backendRequest } from "@/lib/server/backend";
import { REASON_MAX_LENGTH, REASON_MIN_LENGTH } from "./reason";
import type { ChangeStatusInput, ChangeStatusResult } from "./types";

const MAX_USER_ID = 2_147_483_647;
const MAX_VERSION = 2_147_483_646;

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Check the reason and refresh the directory.",
  401: "Your session has expired. Sign in again.",
  403: "You do not have permission to change this account.",
  404: "This account no longer exists.",
  409: "This account changed. Refresh the directory before trying again.",
  429: "Too many requests. Please wait before trying again.",
};

const UNCERTAIN_MESSAGE =
  "The change could not be confirmed. Refresh the directory to check the account before trying again.";

export async function changeUserStatusAction(
  input: ChangeStatusInput,
): Promise<ChangeStatusResult> {
  const reason = typeof input?.reason === "string" ? input.reason.trim() : "";

  if (
    !input ||
    !Number.isSafeInteger(input.userId) ||
    input.userId < 1 ||
    input.userId > MAX_USER_ID ||
    !Number.isSafeInteger(input.expectedVersion) ||
    input.expectedVersion < 0 ||
    input.expectedVersion > MAX_VERSION ||
    typeof input.suspended !== "boolean" ||
    reason.length < REASON_MIN_LENGTH ||
    reason.length > REASON_MAX_LENGTH
  ) {
    return {
      ok: false,
      message: `Provide a valid account and a reason between ${REASON_MIN_LENGTH} and ${REASON_MAX_LENGTH} characters.`,
      refreshRequired: false,
    };
  }

  try {
    // The backend rechecks the live session, role, and target permissions.
    const response = await backendRequest(
      `/admin/users/${input.userId}/status`,
      {
        method: "PATCH",
        body: {
          expectedVersion: input.expectedVersion,
          suspended: input.suspended,
          reason,
        },
      },
    );

    if (response.ok) {
      // The same response carries the refreshed pages to the browser.
      revalidatePath("/admin/users");
      revalidatePath("/admin/audit");

      return {
        ok: true,
        message: input.suspended
          ? "Account suspended. Existing sessions were revoked."
          : "Account restored. The user can sign in again.",
        refreshRequired: false,
      };
    }

    return {
      ok: false,
      message: STATUS_MESSAGES[response.status] ?? UNCERTAIN_MESSAGE,
      refreshRequired: response.status !== 429,
    };
  } catch {
    return { ok: false, message: UNCERTAIN_MESSAGE, refreshRequired: true };
  }
}