import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { confirmBeforeSubmit } from "@/lib/confirm-submit";
import {
  canChangeRole,
  canRemoveMember,
  isLastOwner,
} from "../permissions";
import type { TeamFormAction, TeamMember, TeamRole } from "../types";

interface MemberCardProps {
  member: TeamMember;
  currentUserId: number;
  currentRole: TeamRole;
  ownerCount: number;
  action: TeamFormAction;
  disabled: boolean;
}

export function MemberCard({
  member,
  currentUserId,
  currentRole,
  ownerCount,
  action,
  disabled,
}: MemberCardProps) {
  const lastOwner = isLastOwner(member, ownerCount);
  const canChange = canChangeRole(currentRole, member, ownerCount);
  const canRemove = canRemoveMember({
    currentRole,
    currentUserId,
    member,
    ownerCount,
  });

  return (
    <article className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <h3 className="font-semibold [overflow-wrap:anywhere]">
          {member.user.name}
          {member.user.id === currentUserId ? " (you)" : ""}
        </h3>
        <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          @{member.user.username} · {member.role}
          {lastOwner ? " · Last owner" : ""}
        </p>
      </div>

      {canChange ? (
        <form
          key={`${member.id}:${member.role}`}
          action={action}
          onSubmit={(event) => {
            const role = new FormData(event.currentTarget).get("role");

            if (
              role === member.role ||
              !window.confirm(
                `Change ${member.user.name}'s role to ${String(role)}?`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="operation" value="role" />
          <input type="hidden" name="userId" value={member.user.id} />

          <fieldset disabled={disabled} className="flex flex-wrap items-end gap-3">
            <div className="min-w-40">
              <SelectField label="Role" name="role" defaultValue={member.role}>
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
                <option value="OWNER">Owner</option>
              </SelectField>
            </div>
            <Button type="submit" variant="secondary">
              Save role
            </Button>
          </fieldset>
        </form>
      ) : null}

      {canRemove ? (
        <form
          action={action}
          onSubmit={confirmBeforeSubmit(
            `Remove ${member.user.name} from this team? Their team project permissions will be removed, and pending invitations to or sent by them will be revoked.`,
          )}
        >
          <input type="hidden" name="operation" value="remove" />
          <input type="hidden" name="userId" value={member.user.id} />

          <Button type="submit" variant="danger" disabled={disabled}>
            Remove member
          </Button>
        </form>
      ) : null}
    </article>
  );
}