import type { User } from "@/features/auth/types";
import { canChangeUserStatus, changeableRoleFor } from "../permissions";
import type { AdminUser } from "../types";
import { RoleChangeForm } from "./role-change-form";
import { StatusChangeForm } from "./status-change-form";

interface UserActionsProps {
  viewer: Pick<User, "id" | "platformRole">;
  user: AdminUser;
}

export function UserActions({ viewer, user }: UserActionsProps) {
  if (user.id === viewer.id) {
    return <span className="text-sm text-muted-foreground">Your account</span>;
  }

  const currentRole = changeableRoleFor(viewer, user);
  const { suspendedAt, accountStateVersion } = user;

  const roleForm = currentRole ? (
    <RoleChangeForm
      userId={user.id}
      username={user.username}
      currentRole={currentRole}
    />
  ) : null;

  // Without a reported status and version there is nothing safe to submit.
  const statusForm =
    canChangeUserStatus(viewer, user) &&
    suspendedAt !== undefined &&
    accountStateVersion !== undefined ? (
      <StatusChangeForm
        userId={user.id}
        username={user.username}
        suspendedAt={suspendedAt}
        accountStateVersion={accountStateVersion}
      />
    ) : null;

  if (!roleForm && !statusForm) {
    return (
      <span className="text-sm text-muted-foreground">
        No actions available
      </span>
    );
  }

  return (
    <div className="space-y-4">
      {roleForm}
      {statusForm}
    </div>
  );
}