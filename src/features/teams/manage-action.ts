"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID_PATTERN } from "@/lib/ids";
import { backendRequest } from "@/lib/server/backend";
import type { TeamManagementState } from "./types";

type TeamRequest = {
  path: string;
  method: "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

type Built = { request: TeamRequest } | { error: string };

function isUserId(value: string): boolean {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

function buildRequest(
  operation: string,
  base: string,
  value: (name: string) => string,
): Built {
  switch (operation) {
    case "invite": {
      const email = value("email");
      const role = value("role");

      if (!email || email.length > 254 || !["MANAGER", "MEMBER"].includes(role)) {
        return { error: "Provide an email address and a valid invitation role." };
      }

      return {
        request: {
          path: `${base}/invitations`,
          method: "POST",
          body: { email, role },
        },
      };
    }

    case "revoke": {
      const id = value("invitationId");

      if (!ID_PATTERN.test(id)) return { error: "Invalid invitation." };

      return {
        request: {
          path: `${base}/invitations/${encodeURIComponent(id)}`,
          method: "DELETE",
        },
      };
    }

    case "role": {
      const id = value("userId");
      const role = value("role");

      if (!isUserId(id) || !["OWNER", "MANAGER", "MEMBER"].includes(role)) {
        return { error: "Choose a valid member and role." };
      }

      return {
        request: {
          path: `${base}/members/${id}/role`,
          method: "PATCH",
          body: { role },
        },
      };
    }

    case "remove":
    case "transfer": {
      const id = value("userId");

      if (!isUserId(id)) return { error: "Choose a valid team member." };

      return operation === "remove"
        ? { request: { path: `${base}/members/${id}`, method: "DELETE" } }
        : {
            request: {
              path: `${base}/transfer-ownership`,
              method: "POST",
              body: { userId: Number(id) },
            },
          };
    }

    case "leave":
      return { request: { path: `${base}/leave`, method: "POST" } };

    default:
      return { error: "Unsupported team action." };
  }
}

export async function manageTeamAction(
  teamId: string,
  _previous: TeamManagementState,
  formData: FormData,
): Promise<TeamManagementState> {
  if (!ID_PATTERN.test(teamId)) {
    return { ok: false, message: "Invalid team." };
  }

  const value = (name: string) => {
    const entry = formData.get(name);
    return typeof entry === "string" ? entry.trim() : "";
  };

  const operation = value("operation");
  const built = buildRequest(
    operation,
    `/teams/${encodeURIComponent(teamId)}`,
    value,
  );

  if ("error" in built) return { ok: false, message: built.error };

  let response: Response;

  try {
    response = await backendRequest(built.request.path, {
      method: built.request.method,
      body: built.request.body,
    });
  } catch {
    return {
      ok: false,
      message:
        "Could not confirm the result. Refresh this page before retrying; the operation may have completed.",
    };
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      message:
        response.status === 401
          ? "Your session expired. Sign in again."
          : typeof result?.error?.message === "string"
            ? result.error.message
            : "Unable to complete the request.",
    };
  }

  revalidatePath("/teams");
  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/teams/${teamId}/members`);

  if (operation === "leave") redirect("/teams");

  if (operation === "transfer") {
    return {
      ok: true,
      message:
        "Ownership transferred. You are now a Manager. Other existing owners keep their roles.",
    };
  }

  const revoked =
    typeof result?.revokedInvitations === "number"
      ? result.revokedInvitations
      : 0;

  return {
    ok: true,
    message:
      (typeof result?.message === "string" ? result.message : "Team updated.") +
      (revoked > 0
        ? ` ${revoked} pending invitation(s) from this member were revoked.`
        : ""),
  };
}