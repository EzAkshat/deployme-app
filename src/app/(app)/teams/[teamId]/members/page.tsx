import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { TeamManagement } from "@/features/teams/components/team-management";
import { buildInvitationViews } from "@/features/teams/invitations";
import { canManageTeam } from "@/features/teams/permissions";
import {
  getTeam,
  getTeamInvitations,
  getTeamMembers,
} from "@/features/teams/queries";
import { ID_PATTERN } from "@/lib/ids";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "Team members" };

type MembersPageProps = {
  params: Promise<{ teamId: string }>;
};

async function MembersContent({ params }: MembersPageProps) {
  const user = await requireUser();

  const { teamId } = await params;
  if (!ID_PATTERN.test(teamId)) notFound();

  const team = await getTeam(teamId);

  const [members, invitationData] = await Promise.all([
    getTeamMembers(teamId),
    canManageTeam(team.role) ? getTeamInvitations(teamId) : Promise.resolve(null),
  ]);

  const invitations = invitationData
    ? buildInvitationViews(invitationData.invitations, invitationData.serverTime)
    : [];

  return (
    <div className="space-y-6">
      <BackLink href={`/teams/${encodeURIComponent(teamId)}`}>
        Team workspace
      </BackLink>

      <PageHeader
        title={team.name}
        description={`Members and invitations · Your role: ${team.role}`}
      />

      <TeamManagement
        teamId={teamId}
        currentUserId={user.id}
        currentRole={team.role}
        members={members}
        invitations={invitations}
      />
    </div>
  );
}

export default function TeamMembersPage(props: MembersPageProps) {
  return (
    <PageContainer size="medium">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted-foreground">
            Loading members and invitations…
          </p>
        }
      >
        <MembersContent {...props} />
      </Suspense>
    </PageContainer>
  );
}