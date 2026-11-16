"use server";

import { redirect } from "next/navigation";
import { callBackend } from "@/lib/server/call-backend";

function parseAuthorizationUrl(value: string): URL | null {
  try {
    const url = new URL(value);

    if (
      url.origin !== "https://github.com" ||
      url.pathname !== "/login/oauth/authorize" ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

/** Only returns on failure; on success it redirects to GitHub. */
export async function connectGitHubAction(): Promise<{ message: string }> {
  const result = await callBackend<{
    authorizationUrl: string;
    expiresAt: string;
  }>("/integrations/github/connect", { method: "POST" });

  if (!result.ok) {
    if (result.status === 401) redirect("/login");

    return { message: result.message };
  }

  const destination = parseAuthorizationUrl(result.data.authorizationUrl);

  if (!destination) {
    return {
      message: "The server returned an invalid GitHub authorization URL.",
    };
  }

  redirect(destination.toString());
}