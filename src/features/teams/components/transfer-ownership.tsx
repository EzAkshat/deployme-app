import { Button } from "@/components/ui/button";
import { NoticeCard } from "@/components/ui/notice-card";
import { SelectField } from "@/components/ui/select-field";
import type { TeamFormAction, TeamMember } from "../types";

interface TransferOwnershipProps {
  otherMembers: TeamMember[];
  action: TeamFormAction;
  disabled: boolean;
}

export function TransferOwnership({
  otherMembers,
  action,
  disabled,
}: TransferOwnershipProps) {
  return (
    <NoticeCard tone="warning" title="Transfer your ownership">
      <p>
        Choose an existing member to become an Owner. You will become a
        Manager. Other existing owners keep their roles. This does not move
        personal projects.
      </p>

      {otherMembers.length === 0 ? (
        <p>
          Invite another member and wait for them to join before transferring
          ownership.
        </p>
      ) : (
        <form
          action={action}
          onSubmit={(event) => {
            const id = Number(new FormData(event.currentTarget).get("userId"));
            const target = otherMembers.find((member) => member.user.id === id);

            if (
              !target ||
              !window.confirm(
                `Transfer your ownership to ${target.user.name}? You will become a Manager and lose access to owner-only actions.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="operation" value="transfer" />

          <fieldset disabled={disabled} className="space-y-3">
            <SelectField label="New owner" name="userId" required defaultValue="">
              <option value="" disabled>
                Select a team member
              </option>
              {otherMembers.map((member) => (
                <option key={member.id} value={member.user.id}>
                  {member.user.name} (@{member.user.username}) — {member.role}
                </option>
              ))}
            </SelectField>

            <Button type="submit" variant="secondary">
              Transfer ownership
            </Button>
          </fieldset>
        </form>
      )}
    </NoticeCard>
  );
}