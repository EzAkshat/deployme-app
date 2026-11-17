import { platformRoleLabel } from "@/features/auth/roles";
import { formatUtcDate } from "@/lib/format";
import { isChangeableRole } from "../role-change";
import type { AdminUser } from "../types";
import { RoleChangeForm } from "./role-change-form";

const HEADINGS = [
  "Account",
  "Email",
  "Platform role",
  "Onboarding",
  "Joined (UTC)",
] as const;

interface UserTableProps {
  users: AdminUser[];
  currentUserId: number;
  canManageRoles: boolean;
}

export function UserTable({
  users,
  currentUserId,
  canManageRoles,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface p-5">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Platform accounts and administrator roles
        </caption>

        <thead>
          <tr className="border-b border-border">
            {HEADINGS.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="py-3 pr-5 font-medium whitespace-nowrap"
              >
                {heading}
              </th>
            ))}
            {canManageRoles ? (
              <th scope="col" className="py-3 pl-5 font-medium">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <th scope="row" className="py-4 pr-5 font-normal">
                <p className="font-medium [overflow-wrap:anywhere]">
                  {user.name}
                  {user.id === currentUserId ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (you)
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-muted-foreground [overflow-wrap:anywhere]">
                  @{user.username}
                </p>
              </th>

              <td className="py-4 pr-5 break-all">{user.email}</td>

              <td className="py-4 pr-5 whitespace-nowrap">
                {platformRoleLabel(user.platformRole)}
              </td>

              <td className="py-4 pr-5">
                {user.onboardingCompletedAt === null ? "Pending" : "Completed"}
              </td>

              <td className="py-4 whitespace-nowrap">
                <time dateTime={user.createdAt}>
                  {formatUtcDate(user.createdAt)}
                </time>
              </td>

              {canManageRoles ? (
                <td className="py-4 pl-5 align-top">
                  {user.id !== currentUserId &&
                  isChangeableRole(user.platformRole) ? (
                    <RoleChangeForm
                      userId={user.id}
                      username={user.username}
                      currentRole={user.platformRole}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {user.id === currentUserId
                        ? "Your account"
                        : "Protected role"}
                    </span>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}