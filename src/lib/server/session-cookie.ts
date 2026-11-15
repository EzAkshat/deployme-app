import "server-only";

import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "deployme_session";

export async function saveSessionCookie(response: Response): Promise<void> {
  const header = response.headers
    .getSetCookie()
    .find((value) => value.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!header) {
    throw new Error("The backend did not return a session cookie.");
  }

  const parts = header.split(";").map((part) => part.trim());
  const cookiePair = parts[0];
  const encodedToken = cookiePair.slice(SESSION_COOKIE_NAME.length + 1);
  const token = decodeURIComponent(encodedToken);

  const expiresAttribute = parts.find((part) =>
    part.toLowerCase().startsWith("expires="),
  );

  const expires = expiresAttribute
    ? new Date(expiresAttribute.slice("expires=".length))
    : null;

  if (
    !token ||
    !expires ||
    !Number.isFinite(expires.getTime()) ||
    expires.getTime() <= Date.now()
  ) {
    throw new Error("The backend returned an invalid session cookie.");
  }

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Preserve the backend's fixed expiry.
    expires,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}