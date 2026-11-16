import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/server/backend";

type FailureReason = "invalid" | "session" | "conflict" | "unavailable";

const STATE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function returnToApp(path: string) {
  const origin = process.env.APP_ORIGIN;

  if (!origin) {
    throw new Error("APP_ORIGIN must be configured.");
  }

  const response = NextResponse.redirect(new URL(path, origin), 303);

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
}

function failure(reason: FailureReason) {
  return returnToApp(`/integrations/github/error?reason=${reason}`);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const state = params.get("state");
  const code = params.get("code");
  const error = params.get("error");

  const duplicateParameters = ["state", "code", "error"].some(
    (name) => params.getAll(name).length > 1,
  );

  const validState = state !== null && STATE_PATTERN.test(state);
  const validCode = code !== null && code.length > 0 && code.length <= 512;
  const validError = error !== null && error.length > 0 && error.length <= 200;

  // Accept either a successful authorization code or a denial.
  const validResult =
    (validCode && error === null) || (validError && code === null);

  if (duplicateParameters || !validState || !validResult) {
    return failure("invalid");
  }

  const query = new URLSearchParams();
  query.set("state", state);

  if (code !== null) query.set("code", code);
  if (error !== null) query.set("error", error);

  try {
    // The helper forwards the session cookie and requests JSON.
    // Express remains responsible for validating and consuming state.
    const response = await backendRequest(
      `/integrations/github/callback?${query.toString()}`,
      { timeoutMs: 60_000 },
    );

    if (response.status === 200) return returnToApp("/dashboard");
    if (response.status === 401) return failure("session");
    if (response.status === 409) return failure("conflict");
    if (response.status === 400) return failure("invalid");

    return failure("unavailable");
  } catch {
    // Do not automatically retry a single-use authorization callback.
    return failure("unavailable");
  }
}