import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";
import { ProjectAccess } from "@/features/project-access/components/project-access";
import { getProjectAccess } from "@/features/project-access/queries";
import { ID_PATTERN } from "@/lib/ids";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "Project access" };

type AccessPageProps = {
  params: Promise<{ projectId: string }>;
};

async function AccessContent({ params }: AccessPageProps) {
  await requireUser();

  const { projectId } = await params;
  if (!ID_PATTERN.test(projectId)) notFound();

  const result = await getProjectAccess(projectId);

  if (!result.ok) {
    if ([400, 403, 404].includes(result.status)) notFound();

    return (
      <Alert tone="error">
        Unable to load project access. Reload this page to retry.
      </Alert>
    );
  }

  const data = result.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project access"
        title={data.project.name}
        actions={
          <LinkButton
            href={`/projects/${encodeURIComponent(projectId)}`}
            prefetch={false}
            variant="secondary"
          >
            Project dashboard
          </LinkButton>
        }
      />

      <ProjectAccess data={data} />
    </div>
  );
}

export default function ProjectAccessPage(props: AccessPageProps) {
  return (
    <PageContainer size="medium">
      <BackLink href="/dashboard">Dashboard</BackLink>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading project access…
            </p>
          }
        >
          <AccessContent {...props} />
        </Suspense>
      </div>
    </PageContainer>
  );
}