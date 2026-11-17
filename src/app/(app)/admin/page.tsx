import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshButton } from "@/components/ui/refresh-button";
import { getAdminOverview } from "@/features/admin/queries";
import type { AdminDeploymentStatus } from "@/features/admin/types";
import { isAdministrator, isSuperAdmin } from "@/features/auth/roles";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

const CARD =
  "block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong";

const DEPLOYMENT_STATUSES: {
  status: AdminDeploymentStatus;
  label: string;
}[] = [
  { status: "PENDING", label: "Pending" },
  { status: "QUEUED", label: "Queued" },
  { status: "BUILDING", label: "Building" },
  { status: "READY", label: "Ready" },
  { status: "FAILED", label: "Failed" },
  { status: "CANCELLED", label: "Cancelled" },
];

const numberFormatter = new Intl.NumberFormat("en-GB");

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-3xl font-semibold tabular-nums">
        {numberFormatter.format(value)}
      </dd>
    </div>
  );
}

async function OverviewSummary() {
  const result = await getAdminOverview();

  if (!result.ok) {
    if (result.status === 403) notFound();

    return (
      <EmptyState
        title="Unable to load platform overview"
        description={result.message}
      >
        <RefreshButton label="Try again" pendingLabel="Trying again…" />
      </EmptyState>
    );
  }

  const { overview } = result.data;

  const counts = new Map(
    overview.deployments.byStatus.map(({ status, count }) => [
      status,
      count,
    ]),
  );

  const generatedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(overview.generatedAt));

  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <div>
        <h2 id="overview-heading" className="text-lg font-semibold">
          Platform overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generated {generatedAt} UTC. Refresh to update these counts.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Users" value={overview.users.total} />
        <StatCard label="Teams" value={overview.teams.total} />
        <StatCard label="Total projects" value={overview.projects.total} />
        <StatCard label="Active projects" value={overview.projects.active} />
        <StatCard
          label="Archived projects"
          value={overview.projects.archived}
        />
        <StatCard
          label="Total deployments"
          value={overview.deployments.total}
        />
      </dl>

      <div>
        <h3 className="font-semibold">Deployments by status</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Counts include all retained deployment records, including those
          belonging to archived projects. Ready status does not confirm
          current website availability.
        </p>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DEPLOYMENT_STATUSES.map(({ status, label }) => (
            <StatCard
              key={status}
              label={label}
              value={counts.get(status) ?? 0}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}

async function AdminHome() {
  const user = await requireUser();

  if (!isAdministrator(user)) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Platform administration"
        title="Administration"
        description="Platform activity and administration tools."
        actions={<RefreshButton label="Refresh overview" />}
      />

      <div className="space-y-8">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading platform overview…
            </p>
          }
        >
          <OverviewSummary />
        </Suspense>

        <section aria-labelledby="admin-tools-heading">
          <h2 id="admin-tools-heading" className="mb-4 text-lg font-semibold">
            Administration tools
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin/users" prefetch={false} className={CARD}>
              <h3 className="font-semibold">Users</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Search accounts and view their platform roles.
              </p>
            </Link>

            <Link href="/admin/projects" prefetch={false} className={CARD}>
              <h3 className="font-semibold">Projects</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Search platform projects and inspect deployment records.
              </p>
            </Link>

            <Link href="/admin/health" prefetch={false} className={CARD}>
              <h3 className="font-semibold">Operational status</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check database, Redis and worker presence.
              </p>
            </Link>

            {isSuperAdmin(user) ? (
              <Link href="/admin/audit" prefetch={false} className={CARD}>
                <h3 className="font-semibold">Audit history</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review administrative changes and their reasons.
                </p>
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <PageContainer>
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted-foreground">
            Loading administration…
          </p>
        }
      >
        <AdminHome />
      </Suspense>
    </PageContainer>
  );
}