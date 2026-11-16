import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";
import { GeneralCard } from "@/features/project-settings/components/general-card";
import { RepositoryCard } from "@/features/project-settings/components/repository-card";
import { SettingsPanel } from "@/features/project-settings/components/settings-panel";
import { getProjectSettings } from "@/features/project-settings/queries";
import { ID_PATTERN } from "@/lib/ids";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "Project settings" };

type SettingsPageProps = {
  params: Promise<{ projectId: string }>;
};

async function SettingsContent({ params }: SettingsPageProps) {
  await requireUser();

  const { projectId } = await params;
  if (!ID_PATTERN.test(projectId)) notFound();

  const result = await getProjectSettings(projectId);

  if (!result.ok) {
    return (
      <Alert tone="error">
        {result.status === 403 || result.status === 404
          ? "This project is unavailable or you do not have permission to manage its settings."
          : "Unable to load project settings. Please reload to retry."}
      </Alert>
    );
  }

  const { project } = result.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Project settings"
        description={project.name}
        actions={
          <LinkButton
            href={`/projects/${encodeURIComponent(project.id)}`}
            prefetch={false}
            variant="secondary"
          >
            Project activity
          </LinkButton>
        }
      />

      <GeneralCard project={project} />
      <RepositoryCard repository={project.gitRepository} />

      <SettingsPanel
        projectId={project.id}
        slug={project.slug}
        initial={{
          rootDirectory: project.rootDirectory,
          installCommand: project.installCommand,
          buildCommand: project.buildCommand,
          outputDirectory: project.outputDirectory,
          spaFallback: project.spaFallback,
        }}
      />
    </div>
  );
}

export default function ProjectSettingsPage(props: SettingsPageProps) {
  return (
    <PageContainer size="narrow">
      <BackLink href="/dashboard">Dashboard</BackLink>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading settings…
            </p>
          }
        >
          <SettingsContent {...props} />
        </Suspense>
      </div>
    </PageContainer>
  );
}