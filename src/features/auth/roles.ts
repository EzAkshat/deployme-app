import type { PlatformRole, User } from "./types";

/** For showing navigation only. The backend decides who may use /admin. */
export function isAdministrator(user: Pick<User, "platformRole">): boolean {
  return (
    user.platformRole === "SITE_ADMIN" || user.platformRole === "SUPER_ADMIN"
  );
}

export function isSuperAdmin(user: Pick<User, "platformRole">): boolean {
  return user.platformRole === "SUPER_ADMIN";
}

const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  USER: "User",
  SITE_ADMIN: "Site administrator",
  SUPER_ADMIN: "Super administrator",
};

export function platformRoleLabel(value: string): string {
  return Object.hasOwn(PLATFORM_ROLE_LABELS, value)
    ? PLATFORM_ROLE_LABELS[value as PlatformRole]
    : "Unknown";
}