"use client";

import { changeUserStatusAction } from "../change-status-action";
import { ReasonedChangeForm } from "./reasoned-change-form";

interface StatusChangeFormProps {
  userId: number;
  username: string;
  suspendedAt: string | null;
  accountStateVersion: number;
}

export function StatusChangeForm({
  userId,
  username,
  suspendedAt,
  accountStateVersion,
}: StatusChangeFormProps) {
  const suspend = suspendedAt === null;
  const label = suspend ? "Suspend account" : "Restore account";

  return (
    <ReasonedChangeForm
      triggerLabel={label}
      submitLabel={label}
      danger={suspend}
      summary={
        <>
          <p>
            {suspend
              ? "Blocks sign-in and revokes existing sessions. Personal deployments are restricted. Existing live websites remain available."
              : "Allows sign-in again. Old sessions and stopped deployments are not restarted."}
          </p>
          <p>
            Account: <strong>@{username}</strong>
          </p>
        </>
      }
      confirmLabel={`I confirm this change for @${username}.`}
      onSubmit={(reason) =>
        changeUserStatusAction({
          userId,
          expectedVersion: accountStateVersion,
          suspended: suspend,
          reason,
        })
      }
    />
  );
}