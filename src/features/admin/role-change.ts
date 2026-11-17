import type { PlatformRole } from "@/features/auth/types";

export const ROLE_REASON_MIN = 10;
export const ROLE_REASON_MAX = 1000;

/** The only roles a super administrator may switch between here. */
export type ChangeableRole = Extract<PlatformRole, "USER" | "SITE_ADMIN">;

export function isChangeableRole(value: unknown): value is ChangeableRole {
  return value === "USER" || value === "SITE_ADMIN";
}

export function toggledRole(role: ChangeableRole): ChangeableRole {
  return role === "USER" ? "SITE_ADMIN" : "USER";
}

export function roleChangeLabel(role: ChangeableRole): string {
  return role === "SITE_ADMIN" ? "Site administrator" : "User";
}