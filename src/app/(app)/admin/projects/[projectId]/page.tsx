import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { RefreshButton } from "@/components/ui/refresh-button";
import { isAdministrator } from "@/features/auth/roles";
import { backendRequest } from "@/lib/server/backend";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = {
  title: "Project details | Administration",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

interface ProjectDetailsData {
  project: {
    id: string;
    name: string;
    slug: string;
    subdomain: string | null;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
    deploymentCount: number;
    ownerUser: {
      id: number;
      username: string;
      suspendedAt: string | null;
    } | null;
    team: {
      id: string;
      name: string;
    } | null;
    lastRecordedPublication: {
      id: string;
      publishedAt: string | null;
    } | null;
  };
  deployments: {
    id: string;
    status:
      | "PENDING"
      | "QUEUED"
      | "BUILDING"
      | "READY"
      | "FAILED"
      | "CANCELLED";
    createdAt: string;
    publishedAt: string | null;
    buildDurationMs: number | null;
    artifactFileCount: number | null;
    artifactSizeBytes: number | null;
    resourceUsage: {
      status: "unavailable" | "partial" | "complete";
      cpuTimeMs: number | null;
      peakObservedMemoryBytes: number | null;
      expectedExecutionCount: number;
      recordedExecutionCount: number;
      sampleCount: number;
    };
  }[];
  nextCursor: string | null;
}

const numbers = new Intl.NumberFormat("en-GB");

function formatDate(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDuration(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value < 0) {
    return "—";
  }

  return `${(value / 1000).toFixed(2)} s`;
}

function formatBytes(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value < 0) {
    return "—";
  }

  if (value < 1024) return `${numbers.format(value)} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(2)} KiB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(2)} MiB`;

  return `${(value / 1024 ** 3).toFixed(2)} GiB`;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 break-words font-medium">{value}</dd>
    </div>
  );
}

function LoadError() {
  return (
    <div className="space-y-3">
      <p role="alert">Unable to load project details. Please try again.</p>
      <RefreshButton label="Try again" pendingLabel="Trying again…" />
    </div>
  );
}

async function ProjectContent({ params, searchParams }: PageProps) {
  const user = await requireUser();

  if (!isAdministrator(user)) notFound();

  const { projectId } = await params;
  const queryParams = await searchParams;

  if (!/^[A-Za-z0-9]{1,128}$/.test(projectId)) notFound();

  const basePath = `/projects/${encodeURIComponent(projectId)}`;
  const after = queryParams.after;

  if (
    after !== undefined &&
    (typeof after !== "string" || !/^[A-Za-z0-9]{1,128}$/.test(after))
  ) {
    return (
      <div className="space-y-3">
        <p role="alert">Invalid deployment pagination cursor.</p>
        <Link href={basePath} prefetch={false} className="underline">
          Return to first page
        </Link>
      </div>
    );
  }

  const query = new URLSearchParams();
  if (after) query.set("after", after);

  let response: Response;

  try {
    response = await backendRequest(
      `/admin/projects/${encodeURIComponent(projectId)}${
        query.size ? `?${query.toString()}` : ""
      }`,
    );
  } catch {
    return <LoadError />;
  }

  if (response.status === 401) redirect("/");
  if (response.status === 403 || response.status === 404) notFound();

  if (response.status === 400) {
    return (
      <div className="space-y-3">
        <p role="alert">The deployment pagination cursor is invalid.</p>
        <Link href={basePath} prefetch={false} className="underline">
          Return to first page
        </Link>
      </div>
    );
  }

  if (!response.ok) return <LoadError />;

  const data = (await response.json()) as ProjectDetailsData;
  const { project, deployments } = data;

  const owner = project.team
    ? `Team: ${project.team.name}`
    : project.ownerUser
      ? `User: ${project.ownerUser.username}${
          project.ownerUser.suspendedAt ? " (suspended)" : ""
        }`
      : "Ownership unavailable";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="break-words text-2xl font-semibold">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Project information and deployment history. All times are UTC.
          </p>
        </div>
        <RefreshButton label="Refresh project" />
      </header>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Detail label="Owner" value={owner} />
        <Detail
          label="Project status"
          value={project.archivedAt ? "Archived" : "Active"}
        />
        <Detail label="Slug" value={project.slug} />
        <Detail label="Subdomain" value={project.subdomain ?? "Not assigned"} />
        <Detail label="Created" value={formatDate(project.createdAt)} />
        <Detail label="Updated" value={formatDate(project.updatedAt)} />
        <Detail
          label="Deployments"
          value={numbers.format(project.deploymentCount)}
        />
        <Detail
          label="Last recorded publication"
          value={
            project.lastRecordedPublication
              ? formatDate(project.lastRecordedPublication.publishedAt)
              : "None recorded"
          }
        />
        {project.archivedAt ? (
          <Detail label="Archived" value={formatDate(project.archivedAt)} />
        ) : null}
      </dl>

      <section aria-labelledby="deployment-history-heading" className="space-y-4">
        <div>
          <h2 id="deployment-history-heading" className="text-lg font-semibold">
            Deployment history
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            CPU time is summed across measured build executions. Memory is
            the highest observed usage. These are build measurements, not
            live website usage. Partial coverage may omit measurements.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ready status and publication history do not confirm current
            website availability.
          </p>
        </div>

        {deployments.length === 0 ? (
          <p>
            {after
              ? "No more deployments on this page."
              : "This project has no deployments."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  {[
                    "Deployment",
                    "Status",
                    "Build duration",
                    "Artifact",
                    "CPU time",
                    "Peak observed memory",
                    "Measurement coverage",
                  ].map((label) => (
                    <th key={label} scope="col" className="p-4">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deployments.map((deployment) => {
                  const usage = deployment.resourceUsage;

                  return (
                    <tr
                      key={deployment.id}
                      className="border-t border-border"
                    >
                      <td className="p-4 align-top">
                        <div className="break-all font-mono text-xs">
                          {deployment.id}
                        </div>
                        <div className="mt-2 whitespace-nowrap">
                          {formatDate(deployment.createdAt)}
                        </div>
                        {deployment.publishedAt ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Published: {formatDate(deployment.publishedAt)}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-4 align-top">{deployment.status}</td>
                      <td className="whitespace-nowrap p-4 align-top">
                        {formatDuration(deployment.buildDurationMs)}
                      </td>
                      <td className="p-4 align-top">
                        <div>{formatBytes(deployment.artifactSizeBytes)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {deployment.artifactFileCount === null
                            ? "File count unavailable"
                            : `${numbers.format(deployment.artifactFileCount)} files`}
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-top">
                        {formatDuration(usage.cpuTimeMs)}
                      </td>
                      <td className="whitespace-nowrap p-4 align-top">
                        {formatBytes(usage.peakObservedMemoryBytes)}
                      </td>
                      <td className="p-4 align-top">
                        <div>
                          {usage.status === "complete"
                            ? "Complete"
                            : usage.status === "partial"
                              ? "Partial"
                              : "Unavailable"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {usage.recordedExecutionCount} of{" "}
                          {usage.expectedExecutionCount} execution records
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {numbers.format(usage.sampleCount)} samples
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <nav
          aria-label="Deployment pagination"
          className="flex items-center gap-4"
        >
          {after ? (
            <Link href={basePath} prefetch={false} className="underline">
              First page
            </Link>
          ) : null}
          {data.nextCursor ? (
            <Link
              href={`${basePath}?${new URLSearchParams({
                after: data.nextCursor,
              }).toString()}`}
              prefetch={false}
              className="underline"
            >
              Older deployments
            </Link>
          ) : null}
        </nav>
      </section>
    </div>
  );
}

export default function AdminProjectDetailsPage(props: PageProps) {
  return (
    <PageContainer>
      <Link href="/projects" prefetch={false} className="text-sm underline">
        Back to projects
      </Link>

      <div className="mt-6">
        <Suspense fallback={<p role="status">Loading project details…</p>}>
          <ProjectContent {...props} />
        </Suspense>
      </div>
    </PageContainer>
  );
}