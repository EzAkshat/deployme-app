"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID_PATTERN } from "@/lib/ids";
import { backendRequest } from "@/lib/server/backend";
import type { TeamActionState } from "./types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_PATTERN = /^(?:[A-Za-z0-9_-]{8}|[a-fA-F0-9]{64})$/;

async function failure(response: Response): Promise<TeamActionState> {
  if (response.status === 401) {
    return { message: "Your session expired. Sign in again before retrying." };
  }

  const data = await response.json().catch(() => null);

  return {
    message:
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Unable to complete this request. Please retry.",
  };
}

function teamPath(id: unknown): string {
  return typeof id === "string" && ID_PATTERN.test(id)
    ? `/teams/${encodeURIComponent(id)}`
    : "/teams";
}

export async function createTeamAction(
  _previous: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const rawName = formData.get("name");
  const rawSlug = formData.get("slug");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";

  if (!name || name.length > 100 || slug.length > 100 || !SLUG_PATTERN.test(slug)) {
    return {
      message:
        "Enter a name and a slug using lowercase letters, numbers and single hyphens.",
    };
  }

  let response: Response;

  try {
    response = await backendRequest("/teams", {
      method: "POST",
      body: { name, slug },
    });
  } catch {
    return {
      message:
        "Could not confirm creation. Reload your teams before retrying; the team may already have been created.",
    };
  }

  if (!response.ok) return failure(response);

  const data = await response.json().catch(() => null);

  revalidatePath("/teams");
  redirect(teamPath(data?.team?.id));
}

export async function acceptTeamInvitationAction(
  _previous: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const rawToken = formData.get("token");
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!TOKEN_PATTERN.test(token)) {
    return {
      message:
        "Use the invitation link from your email or enter its invitation code.",
    };
  }

  let response: Response;

  try {
    response = await backendRequest("/teams/invitations/accept", {
      method: "POST",
      body: { token },
    });
  } catch {
    return {
      message:
        "Could not confirm acceptance. Check your Teams page before retrying.",
    };
  }

  if (!response.ok) return failure(response);

  const data = await response.json().catch(() => null);

  revalidatePath("/teams");
  redirect(teamPath(data?.membership?.teamId));
}
export async function respondToTeamInvitationAction(
  previous: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const operation = formData.get("operation");

  if (operation === "accept") {
    return acceptTeamInvitationAction(previous, formData);
  }

  if (operation !== "decline") {
    return { message: "Choose Accept invitation or Decline invitation." };
  }

  const rawToken = formData.get("token");
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!TOKEN_PATTERN.test(token)) {
    return {
      message:
        "Use the invitation link from your email or enter its invitation code.",
    };
  }

  let response: Response;

  try {
    response = await backendRequest("/teams/invitations/decline", {
      method: "POST",
      body: { token },
    });
  } catch {
    return {
      message:
        "Could not confirm the decline. You can retry declining; repeating this action will not join the team.",
    };
  }

  if (!response.ok) return failure(response);

  revalidatePath("/teams");

  return {
    declined: true,
    message: "Invitation declined. You have not joined the team.",
  };
}