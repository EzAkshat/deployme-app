"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { RefreshButton } from "@/components/ui/refresh-button";
import { manageTeamAction } from "../manage-action";
import { canManageTeam, countOwners } from "../permissions";
import type {
  InvitationView,
  TeamManagementState,
  TeamMember,
  TeamRole,
} from "../types";
import { InvitationList } from "./invitation-list";
import { InviteForm } from "./invite-form";
import { LeaveTeam } from "./leave-team";
import { MemberCard } from "./member-card";
import { TransferOwnership } from "./transfer-ownership";

const INITIAL_STATE: TeamManagementState = { ok: false, message: "" };

interface TeamManagementProps {
  teamId: string;
  currentUserId: number;
  currentRole: TeamRole;
  members: TeamMember[];
  invitations: InvitationView[];
}

export function TeamManagement({
  teamId,
  currentUserId,
  currentRole,
  members,
  invitations,
}: TeamManagementProps) {
  const [state, action, pending] = useActionState(
    manageTeamAction.bind(null, teamId),
    INITIAL_STATE,
  );

  const ownerCount = countOwners(members);
  const otherMembers = members.filter(
    (member) => member.user.id !== currentUserId,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Members</h2>
        <RefreshButton label="Refresh members and invitations" />
      </div>

      {state.message ? (
        <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      {pending ? (
        <p role="status" className="text-sm">
          Updating team…
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Only owners can change roles. Project deployment access still requires
        an explicit project permission. Changing someone to Member also revokes
        their pending invitations.
      </p>

      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            currentRole={currentRole}
            ownerCount={ownerCount}
            action={action}
            disabled={pending}
          />
        ))}
      </div>

      {canManageTeam(currentRole) ? (
        <>
          <InviteForm action={action} disabled={pending} />
          <InvitationList
            invitations={invitations}
            action={action}
            disabled={pending}
          />
        </>
      ) : null}

      {currentRole === "OWNER" ? (
        <TransferOwnership
          otherMembers={otherMembers}
          action={action}
          disabled={pending}
        />
      ) : null}

      <LeaveTeam
        isLastOwner={currentRole === "OWNER" && ownerCount === 1}
        action={action}
        disabled={pending}
      />
    </div>
  );
}