import { platformRoleLabel } from "@/features/auth/roles";
import type { User } from "@/features/auth/types";
import { formatUtcDate } from "@/lib/format";
import { accountStatusLabel } from "../account-status";
import type { AdminUser } from "../types";
import { UserActions } from "./user-actions";

const HEADINGS = [
  "Account",
  "Email",
  "Platform role",
  "Onboarding",
  "Joined (UTC)",
  "Account status",
  "Actions",
] as const;

interface UserTableProps {
  users: AdminUser[];
  viewer: Pick<User, "id" | "platformRole">;
}

function StatusCell({ suspendedAt }: { suspendedAt: string | null | undefined }) {
  const label = accountStatusLabel(suspendedAt);

  return (
    <>
      <span
        className={
          label === "Suspended"
            ? "font-medium text-destructive"
            : label === "Unknown"
              ? "text-muted-foreground"
              : ""
        }
      >
        {label}
      </span>
      {label === "Suspended" && suspendedAt ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Since {formatUtcDate(suspendedAt)}
        </p>
      ) : null}
    </>
  );
}

export function UserTable({ users, viewer }: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface p-5">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Platform accounts, roles and account status
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
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <th scope="row" className="py-4 pr-5 font-normal">
                <p className="font-medium [overflow-wrap:anywhere]">
                  {user.name}
                  {user.id === viewer.id ? (
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

              <td className="py-4 pr-5 whitespace-nowrap">
                <time dateTime={user.createdAt}>
                  {formatUtcDate(user.createdAt)}
                </time>
              </td>

              <td className="py-4 pr-5 whitespace-nowrap">
                <StatusCell suspendedAt={user.suspendedAt} />
              </td>

              <td className="py-4 align-top">
                <UserActions viewer={viewer} user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}