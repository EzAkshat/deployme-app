"use server";

import { revalidatePath } from "next/cache";
import { backendRequest } from "@/lib/server/backend";
import { REASON_MAX_LENGTH, REASON_MIN_LENGTH } from "./reason";
import { isChangeableRole } from "./role-change";
import type { ChangeRoleInput, ChangeRoleResult } from "./types";

const STATUS_MESSAGES: Record<number, string> = {
  400: "The role-change request was invalid.",
  401: "Your session has expired. Sign in again.",
  403: "You are not permitted to change this account’s role.",
  404: "This account no longer exists.",
  409: "The account’s role changed. Refresh before submitting again.",
  429: "Too many requests. Please wait before trying again.",
};

const UNCERTAIN_MESSAGE =
  "The change could not be confirmed. Refresh the directory before retrying.";

export async function changeUserRoleAction(
  input: ChangeRoleInput,
): Promise<ChangeRoleResult> {
  const reason = typeof input?.reason === "string" ? input.reason.trim() : "";

  if (
    !input ||
    !Number.isSafeInteger(input.userId) ||
    input.userId <= 0 ||
    input.userId > 2_147_483_647 ||
    !isChangeableRole(input.expectedRole) ||
    !isChangeableRole(input.nextRole) ||
    reason.length < REASON_MIN_LENGTH ||
    reason.length > REASON_MAX_LENGTH
  ) {
    return {
      ok: false,
      status: 400,
      message: `Provide valid roles and a reason between ${REASON_MIN_LENGTH} and ${REASON_MAX_LENGTH} characters.`,
    };
  }

  try {
    const response = await backendRequest(`/admin/users/${input.userId}/role`, {
      method: "PATCH",
      body: {
        expectedRole: input.expectedRole,
        nextRole: input.nextRole,
        reason,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: STATUS_MESSAGES[response.status] ?? UNCERTAIN_MESSAGE,
      };
    }

    const data = (await response.json()) as { changed: boolean };

    if (typeof data.changed !== "boolean") {
      throw new Error("Unexpected role-change response.");
    }

    // The same response carries the refreshed pages to the browser.
    revalidatePath("/admin/users");
    revalidatePath("/admin/audit");

    return { ok: true, changed: data.changed };
  } catch {
    return { ok: false, status: 503, message: UNCERTAIN_MESSAGE };
  }
}