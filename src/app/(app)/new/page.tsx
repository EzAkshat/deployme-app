import { Suspense } from "react";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ImportHeader } from "@/features/import/components/import-header";
import { ImportIntro } from "@/features/import/components/import-intro";
import { ImportProblem } from "@/features/import/components/import-problem";
import { InstallationStep } from "@/features/import/components/installation-step";
import { RepositoryStep } from "@/features/import/components/repository-step";
import { resolveImportDestination } from "@/features/import/destination";
import { readGitHubConnection } from "@/features/import/queries";
import { parseImportQuery, type SearchParams } from "@/features/import/url";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "New project" };

type NewProjectProps = { searchParams: Promise<SearchParams> };

async function ImportContent({ searchParams }: NewProjectProps) {
  await requireUser();

  const query = parseImportQuery(await searchParams);
  if (!query.ok) return <ImportProblem message={query.message} />;

  const destination = await resolveImportDestination(query.teamId);
  if (!destination.ok) return <ImportProblem message={destination.message} />;

  const connection = await readGitHubConnection();
  if (!connection.ok) return <ImportProblem message={connection.message} />;

  const github = connection.data.connection;
  if (!github) {
    return <ImportProblem message="Connect GitHub from your dashboard first." />;
  }

  return (
    <>
      <ImportHeader team={destination.team} githubLogin={github.githubLogin} />

      {query.installationId === null ? (
        <InstallationStep page={query.page} teamId={query.teamId} />
      ) : (
        <RepositoryStep
          installationId={query.installationId}
          page={query.page}
          teamId={query.teamId}
        />
      )}
    </>
  );
}

export default function NewProjectPage(props: NewProjectProps) {
  return (
    <PageContainer>
      <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <ImportIntro />

        <section
          aria-label="Import a repository"
          className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-7"
        >
          <Suspense
            fallback={
              <p role="status" className="text-sm text-muted-foreground">
                Loading your GitHub repositories…
              </p>
            }
          >
            <ImportContent {...props} />
          </Suspense>
        </section>
      </div>
    </PageContainer>
  );
}