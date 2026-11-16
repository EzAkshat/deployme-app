import { Suspense } from "react";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { GitHubConnectCard } from "@/features/github/components/github-connect-card";
import { getGitHubConnection } from "@/features/github/queries";
import { DeploymentHistory } from "@/features/projects/components/deployment-history";
import { ProjectList } from "@/features/projects/components/project-list";
import { getPersonalProjects } from "@/features/projects/queries";
import { requireUser } from "@/lib/server/require-user";
import { PlusIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Dashboard" };

const PROJECT_ID_PATTERN = /^[\w-]{1,128}$/;

type DashboardProps = {
  searchParams: Promise<{ history?: string | string[] }>;
};

async function DashboardContent({ searchParams }: DashboardProps) {
  await requireUser();

  const [projects, connection, params] = await Promise.all([
    getPersonalProjects(),
    getGitHubConnection(),
    searchParams,
  ]);

  // Only a valid ID that belongs to one of this person's projects counts.
  const requested =
    typeof params.history === "string" &&
      PROJECT_ID_PATTERN.test(params.history)
      ? params.history
      : null;
  const selected = projects.find((project) => project.id === requested) ?? null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal workspace"
        title="Build something. Ship it."
        description="Your projects, from first commit to the web."
        actions={
          <LinkButton href="/new" prefetch={false}>
            <PlusIcon /> New project
          </LinkButton>
        }
      />

      <GitHubConnectCard connection={connection} />

      <ProjectList projects={projects} selectedId={selected?.id ?? null} />

      {selected ? <DeploymentHistory project={selected} /> : null}
    </PageContainer>
  );
}

function DashboardSkeleton() {
  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold">Your workspace</h1>
      <p role="status" className="mt-3 text-sm text-muted-foreground">
        Loading your dashboard…
      </p>
    </PageContainer>
  );
}

export default function DashboardPage(props: DashboardProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}