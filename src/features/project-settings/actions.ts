"use server";

import { revalidatePath } from "next/cache";
import { ID_PATTERN } from "@/lib/ids";
import { backendRequest } from "@/lib/server/backend";
import type { SettingsState } from "./types";
import { readPublicBuildVariables } from "@/features/build-variables/parse";

async function failureMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  if (response.status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (response.status === 403 || response.status === 404) {
    return "This project is unavailable or you do not have permission to manage it.";
  }

  const data = await response.json().catch(() => null);

  return typeof data?.error?.message === "string"
    ? data.error.message
    : fallback;
}

export async function saveProjectSettings(
  projectId: string,
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!ID_PATTERN.test(projectId)) {
    return { ok: false, message: "Invalid project." };
  }

  const names = [
    "rootDirectory",
    "installCommand",
    "buildCommand",
    "outputDirectory",
  ] as const;

  const values: Record<string, string> = {};

  for (const name of names) {
    const value = formData.get(name);

    if (typeof value !== "string") {
      return { ok: false, message: "Please complete the settings form." };
    }

    values[name] = value.trim();
  }

  if (
    !values.rootDirectory ||
    !values.outputDirectory ||
    values.rootDirectory.length > 255 ||
    values.outputDirectory.length > 255 ||
    values.installCommand.length > 500 ||
    values.buildCommand.length > 500
  ) {
    return {
      ok: false,
      message: "Check the directory names and command lengths.",
    };
  }
  const variableResult = readPublicBuildVariables(formData);

  if (!variableResult.ok) {
    return { ok: false, message: variableResult.message };
  }
  let response: Response;

  try {
    response = await backendRequest(
      `/projects/${encodeURIComponent(projectId)}/settings`,
      {
        method: "PATCH",
        body: {
          ...values,
          spaFallback: formData.get("spaFallback") === "on",
          ...(variableResult.variables !== undefined && {
            publicBuildVariables: variableResult.variables,
          }),
        },
      },
    );
  } catch {
    return {
      ok: false,
      message:
        "Could not confirm the save. Check your connection and reload settings before retrying.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message: await failureMessage(response, "Unable to save settings."),
    };
  }

  const result = await response.json().catch(() => null);

  revalidatePath(`/projects/${projectId}/settings`);
  revalidatePath(`/projects/${projectId}`);

  return {
    ok: true,
    message: result?.routingRefreshQueued
      ? "Settings saved. A routing update was queued for SPA fallback. Build settings and public variables require a new deployment; no rebuild was started."
      : "Settings saved. Start a new deployment to publish build-setting or public-variable changes. Existing deployments are unchanged.",
  };
}

export async function archiveProjectAction(
  projectId: string,
  _previous: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!ID_PATTERN.test(projectId)) {
    return { ok: false, message: "Invalid project." };
  }

  const confirmation = formData.get("confirmation");

  if (typeof confirmation !== "string") {
    return { ok: false, message: "Enter the project slug to confirm." };
  }

  let response: Response;

  try {
    // Verify the confirmation against the current project, not a hidden input.
    const current = await backendRequest(
      `/projects/${encodeURIComponent(projectId)}/settings`,
    );

    if (!current.ok) {
      return {
        ok: false,
        message: await failureMessage(
          current,
          "Unable to verify this project.",
        ),
      };
    }

    const { project } = await current.json();

    if (confirmation !== project.slug) {
      return {
        ok: false,
        message: "The confirmation must exactly match the project slug.",
      };
    }

    response = await backendRequest(
      `/projects/${encodeURIComponent(projectId)}/archive`,
      { method: "POST" },
    );
  } catch {
    return {
      ok: false,
      message:
        "Could not confirm archival. Check the dashboard before retrying; the request may have completed.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message: await failureMessage(response, "Unable to archive the project."),
    };
  }

  const result = await response.json().catch(() => null);

  revalidatePath("/dashboard");
  revalidatePath("/teams", "layout");
  revalidatePath(`/projects/${projectId}`, "layout");

  return {
    ok: true,
    archived: true,
    message:
      result?.deliveryDisableStatus === "completed"
        ? "Project archived and public delivery disabled."
        : "Project archived. Public delivery shutdown is pending.",
  };
}
