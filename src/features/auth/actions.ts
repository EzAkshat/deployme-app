"use server";

import { callBackend } from "@/lib/server/call-backend";
import {
  clearSessionCookie,
  saveSessionCookie,
} from "@/lib/server/session-cookie";
import type { ActionResult } from "@/lib/result";
import type { User } from "./types";

type OtpRequestData = { challengeId: string; message: string };
type UserData = { user: User; message: string };

const UNCERTAIN_MESSAGE =
  "Unable to complete the request. Please try again. If you just verified a code, reload to check your session before requesting another.";

function invalid(message: string): ActionResult<never> {
  return { ok: false, status: 400, message };
}

export async function requestOtpAction(
  email: string,
): Promise<ActionResult<OtpRequestData>> {
  if (typeof email !== "string" || email.length === 0 || email.length > 254) {
    return invalid("Enter a valid email address.");
  }

  return callBackend<OtpRequestData>("/auth/request-otp", {
    method: "POST",
    body: { email },
    unavailableMessage: UNCERTAIN_MESSAGE,
  });
}

export async function verifyOtpAction(
  email: string,
  challengeId: string,
  code: string,
): Promise<ActionResult<UserData>> {
  if (
    typeof email !== "string" ||
    typeof challengeId !== "string" ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    return invalid("Enter the six-digit code.");
  }

  return callBackend<UserData>("/auth/verify-otp", {
    method: "POST",
    body: { email, challengeId, code },
    onSuccess: saveSessionCookie,
    unavailableMessage: UNCERTAIN_MESSAGE,
  });
}

export async function completeOnboardingAction(
  name: string,
): Promise<ActionResult<UserData>> {
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.length > 100
  ) {
    return invalid("Enter your name.");
  }

  return callBackend<UserData>("/auth/onboarding", {
    method: "PATCH",
    body: { name },
    unavailableMessage: UNCERTAIN_MESSAGE,
  });
}

export async function logoutAction(): Promise<ActionResult<{ message: string }>> {
  return callBackend<{ message: string }>("/auth/logout", {
    method: "POST",
    onSuccess: clearSessionCookie,
    unavailableMessage: UNCERTAIN_MESSAGE,
  });
}