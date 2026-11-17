import "server-only";

import { headers } from "next/headers";

export interface RequestSite {
  isAdmin: boolean;
  origin: string;
}

export async function getRequestSite(): Promise<RequestSite> {
  const appOrigin = process.env.APP_ORIGIN;
  const adminOrigin = process.env.ADMIN_ORIGIN;

  if (!appOrigin || !adminOrigin) {
    throw new Error("APP_ORIGIN and ADMIN_ORIGIN must be configured.");
  }

  const app = new URL(appOrigin);
  const admin = new URL(adminOrigin);

  if (
    !["http:", "https:"].includes(app.protocol) ||
    !["http:", "https:"].includes(admin.protocol)
  ) {
    throw new Error("Application origins must use HTTP or HTTPS.");
  }

  if (app.host.toLowerCase() === admin.host.toLowerCase()) {
    throw new Error("Application and admin hosts must be different.");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.toLowerCase();

  if (host === admin.host.toLowerCase()) {
    return { isAdmin: true, origin: admin.origin };
  }

  if (host === app.host.toLowerCase()) {
    return { isAdmin: false, origin: app.origin };
  }

  throw new Error("Unrecognized application host.");
}