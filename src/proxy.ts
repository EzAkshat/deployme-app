import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ROUTES: Record<string, string> = {
  "/": "/login",
  "/dashboard": "/admin",
  "/users": "/admin/users",
  "/audit": "/admin/audit",
  "/health": "/admin/health",
  "/projects": "/admin/projects",
};

const LEGACY_ROUTES: Record<string, string> = {
  "/login": "/",
  "/admin": "/dashboard",
  "/admin/users": "/users",
  "/admin/audit": "/audit",
  "/admin/health": "/health",
  "/admin/projects": "/projects",
};

function getAdminInternalPath(path: string): string | undefined {
  if (/^\/projects\/[A-Za-z0-9]{1,128}$/.test(path)) {
    return `/admin${path}`;
  }

  return ADMIN_ROUTES[path];
}

function getAdminPublicPath(path: string): string | undefined {
  if (/^\/admin\/projects\/[A-Za-z0-9]{1,128}$/.test(path)) {
    return path.slice("/admin".length);
  }

  return LEGACY_ROUTES[path];
}

export function proxy(request: NextRequest) {
  const appOrigin = process.env.APP_ORIGIN;
  const adminOrigin = process.env.ADMIN_ORIGIN;

  if (!appOrigin || !adminOrigin) {
    throw new Error("APP_ORIGIN and ADMIN_ORIGIN must be configured.");
  }

  const app = new URL(appOrigin);
  const admin = new URL(adminOrigin);
  const host = request.headers.get("host")?.toLowerCase();

  const isAdmin = host === admin.host.toLowerCase();
  const isApp = host === app.host.toLowerCase();

  if (!isAdmin && !isApp) {
    return new NextResponse("Unrecognized application host.", {
      status: 400,
    });
  }

  const path = request.nextUrl.pathname;
  const isRead = request.method === "GET" || request.method === "HEAD";

  // Existing main-site administration links open the admin application.
  if (!isAdmin) {
    if (path === "/admin" || path.startsWith("/admin/")) {
      if (!isRead) {
        return new NextResponse("Not found.", { status: 404 });
      }

      const targetPath = getAdminPublicPath(path);

      if (!targetPath) {
        return new NextResponse("Not found.", { status: 404 });
      }

      const destination = new URL(targetPath, admin.origin);
      destination.search = request.nextUrl.search;

      return NextResponse.redirect(destination, 307);
    }

    return NextResponse.next();
  }

  // Allow the shared application's assets.
  if (
    path.startsWith("/_next/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/icon.svg" ||
    path === "/icon.png" ||
    path === "/apple-icon.png"
  ) {
    return NextResponse.next();
  }

  // Keep existing admin links functional while using clean public URLs.
  const canonicalPath = getAdminPublicPath(path);

  if (canonicalPath) {
    if (isRead) {
      const destination = new URL(canonicalPath, admin.origin);
      destination.search = request.nextUrl.search;

      return NextResponse.redirect(destination, 307);
    }

    // Preserve Server Action POSTs made from an existing internal route.
    return NextResponse.next();
  }

  const internalPath = getAdminInternalPath(path);

  if (!internalPath) {
    return new NextResponse("Not found.", { status: 404 });
  }

  const destination = request.nextUrl.clone();
  destination.pathname = internalPath;

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
