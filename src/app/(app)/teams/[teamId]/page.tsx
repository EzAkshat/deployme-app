import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { TeamProjectCard } from "@/features/teams/components/team-project-card";
import { canManageTeam } from "@/features/teams/permissions";
import { getTeam, getTeamProjects } from "@/features/teams/queries";
import { ID_PATTERN } from "@/lib/ids";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "Team workspace" };

type WorkspacePageProps = {
  params: Promise<{ teamId: string }>;
};

async function WorkspaceContent({ params }: WorkspacePageProps) {
  await requireUser();

  const { teamId } = await params;
  if (!ID_PATTERN.test(teamId)) notFound();

  const team = await getTeam(teamId);
  const projects = await getTeamProjects(teamId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Your role: ${team.role}`}
        title={team.name}
        actions={
          <>
            <LinkButton
              href={`/teams/${encodeURIComponent(teamId)}/members`}
              prefetch={false}
              variant="secondary"
            >
              Members and invitations
            </LinkButton>
            {canManageTeam(team.role) ? (
              <LinkButton
                href={`/new?team=${encodeURIComponent(team.id)}`}
                prefetch={false}
              >
                ＋ New team project
              </LinkButton>
            ) : null}
          </>
        }
      />

      <h2 className="text-xl font-semibold">Team projects</h2>
      <p className="text-sm text-muted-foreground">
        Only projects you have permission to view appear here.
      </p>

      {projects.length === 0 ? (
        <p>No projects are currently visible to you in this team.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <TeamProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default function TeamWorkspacePage(props: WorkspacePageProps) {
  return (
    <PageContainer size="medium">
      <BackLink href="/teams">Your teams</BackLink>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading workspace…
            </p>
          }
        >
          <WorkspaceContent {...props} />
        </Suspense>
      </div>
    </PageContainer>
  );
}