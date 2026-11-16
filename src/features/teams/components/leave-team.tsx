import { Button } from "@/components/ui/button";
import { NoticeCard } from "@/components/ui/notice-card";
import { confirmBeforeSubmit } from "@/lib/confirm-submit";
import type { TeamFormAction } from "../types";

interface LeaveTeamProps {
  isLastOwner: boolean;
  action: TeamFormAction;
  disabled: boolean;
}

export function LeaveTeam({ isLastOwner, action, disabled }: LeaveTeamProps) {
  return (
    <NoticeCard tone="danger" title="Leave team">
      <p>
        Leaving removes your team membership and team project permissions.
        Pending invitations to or sent by you are revoked. Your personal
        projects stay with you.
      </p>

      {isLastOwner ? (
        <p className="font-medium">
          You are the last owner. Transfer ownership or make another member an
          Owner before leaving.
        </p>
      ) : (
        <form
          action={action}
          onSubmit={confirmBeforeSubmit(
            "Leave this team? Your team access and project permissions will be removed.",
          )}
        >
          <input type="hidden" name="operation" value="leave" />

          <Button type="submit" variant="destructive" disabled={disabled}>
            Leave team
          </Button>
        </form>
      )}
    </NoticeCard>
  );
}