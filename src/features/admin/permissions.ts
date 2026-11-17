import type { PlatformRole } from "@/features/auth/types";
import { isChangeableRole, type ChangeableRole } from "./role-change";
import type { AdminUser } from "./types";

type Viewer = { id: number; platformRole?: PlatformRole };

/** Returns the target's role if the viewer may switch it, otherwise null. */
export function changeableRoleFor(
  viewer: Viewer,
  target: AdminUser,
): ChangeableRole | null {
  if (viewer.platformRole !== "SUPER_ADMIN" || target.id === viewer.id) {
    return null;
  }

  return isChangeableRole(target.platformRole) ? target.platformRole : null;
}

/**
 * Super administrators may suspend anyone but themselves and other super
 * administrators; site administrators may suspend ordinary users only.
 */
export function canChangeUserStatus(viewer: Viewer, target: AdminUser): boolean {
  if (target.id === viewer.id || target.platformRole === "SUPER_ADMIN") {
    return false;
  }

  return (
    viewer.platformRole === "SUPER_ADMIN" ||
    (viewer.platformRole === "SITE_ADMIN" && target.platformRole === "USER")
  );
}