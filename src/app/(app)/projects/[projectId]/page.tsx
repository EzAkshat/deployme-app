import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { ProjectActivity } from "@/features/deployments/components/project-activity";
import {
  PROJECT_ID_PATTERN,
  parseActivityQuery,
} from "@/features/deployments/query";
import type { ProjectActivityData } from "@/features/deployments/types";
import { readBackend } from "@/lib/server/read-backend";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = { title: "Project" };

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function ActivityContent({ params, searchParams }: ProjectPageProps) {
  await requireUser();

  const { projectId } = await params;
  if (!PROJECT_ID_PATTERN.test(projectId)) notFound();

  const parsed = parseActivityQuery(await searchParams);
  if (!parsed.ok) notFound();

  const suffix = parsed.query.toString();

  const result = await readBackend<ProjectActivityData>(
    `/projects/${encodeURIComponent(projectId)}/activity${suffix ? `?${suffix}` : ""}`,
  );

  if (!result.ok) {
    if ([400, 403, 404].includes(result.status)) notFound();

    return (
      <Alert tone="error">
        Unable to load project activity. Please reload to retry.
      </Alert>
    );
  }

  const initial = result.data;

  if (parsed.query.has("deployment") && initial.deployments.length === 0) {
    notFound();
  }

  return (
    <ProjectActivity
      key={`${projectId}:${suffix}`}
      initial={initial}
      query={suffix}
      pinned={parsed.query.has("deployment")}
      historical={parsed.query.has("before")}
    />
  );
}

export default function ProjectPage(props: ProjectPageProps) {
  return (
    <PageContainer>
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading project activity…
            </p>
          }
        >
          <ActivityContent {...props} />
        </Suspense>
      </div>
    </PageContainer>
  );
}