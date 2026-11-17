"use client";

import { changeUserRoleAction } from "../change-role-action";
import {
    roleChangeLabel,
    toggledRole,
    type ChangeableRole,
} from "../role-change";
import { ReasonedChangeForm } from "./reasoned-change-form";

interface RoleChangeFormProps {
    userId: number;
    username: string;
    currentRole: ChangeableRole;
}

export function RoleChangeForm({
    userId,
    username,
    currentRole,
}: RoleChangeFormProps) {
    const nextRole = toggledRole(currentRole);

    return (
        <ReasonedChangeForm
            triggerLabel="Change role"
            submitLabel="Confirm role change"
            summary={
                <p>
                    Change <strong>@{username}</strong> to{" "}
                    <strong>{roleChangeLabel(nextRole)}</strong>.
                </p>
            }
            confirmLabel="I understand this changes platform permissions and signs this account out of its existing sessions."
            onSubmit={async (reason) => {
                const result = await changeUserRoleAction({
                    userId,
                    expectedRole: currentRole,
                    nextRole,
                    reason,
                });

                if (result.ok) {
                    return {
                        ok: true,
                        message: result.changed
                            ? "Role updated. Existing sessions were revoked."
                            : "The account already has this role.",
                        refreshRequired: false,
                    };
                }

                return {
                    ok: false,
                    message: result.message,
                    refreshRequired: result.status !== 400 && result.status !== 429,
                };
            }}
        />
    );
}