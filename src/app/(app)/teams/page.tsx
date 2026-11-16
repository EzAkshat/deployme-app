import { Suspense } from "react";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CreateTeamForm } from "@/features/teams/components/create-team-form";
import { TeamCard } from "@/features/teams/components/team-card";
import { getMyTeams } from "@/features/teams/queries";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "Teams" };

async function TeamsContent() {
  await requireUser();
  const teams = await getMyTeams();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your teams"
        description="Collaborate in a team, or keep deploying in your personal workspace."
        actions={
          <LinkButton href="/invitations/accept" variant="secondary">
            Accept an invitation
          </LinkButton>
        }
      />

      <section aria-label="Your team memberships" className="grid gap-4 sm:grid-cols-2">
        {teams.length === 0 ? (
          <p className="text-muted-foreground">You haven’t joined any teams yet.</p>
        ) : null}

        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </section>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Create a team</h2>
        <p className="text-sm text-muted-foreground">
          You become the owner of the team you create.
        </p>
        <CreateTeamForm />
      </Card>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <PageContainer size="medium">
      <BackLink href="/dashboard">Personal workspace</BackLink>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading teams…
            </p>
          }
        >
          <TeamsContent />
        </Suspense>
      </div>
    </PageContainer>
  );
}