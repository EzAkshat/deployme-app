import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshButton } from "@/components/ui/refresh-button";
import { HealthReport } from "@/features/admin/components/health-report";
import { getAdminHealth } from "@/features/admin/queries";
import { isAdministrator } from "@/features/auth/roles";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Operational status · Administration",
  robots: { index: false, follow: false },
};

function HealthNotice({ message }: { message: string }) {
  return (
    <EmptyState title="Unable to load operational status" description={message}>
      <RefreshButton label="Try again" pendingLabel="Trying again…" />
    </EmptyState>
  );
}

async function OperationalHealth() {
  // A database outage can fail the session check before any health probe
  // runs, so report that explicitly instead of erroring the whole page.
  const session = await getCurrentUser().then(
    (user) => ({ ok: true as const, user }),
    () => ({ ok: false as const }),
  );

  if (!session.ok) {
    return (
      <HealthNotice message="Your session could not be checked. The API or database may be unavailable." />
    );
  }

  if (!session.user) redirect("/login");
  if (session.user.onboardingCompletedAt === null) redirect("/onboarding");

  const result = await getAdminHealth();

  if (!result.ok) {
    if (result.status === 403) {
      // The backend decides access. Non-administrators get a 404.
      if (!isAdministrator(session.user)) notFound();

      return (
        <HealthNotice message="Administrator access is required to view this page." />
      );
    }

    return (
      <HealthNotice
        message={
          result.status === 503
            ? "The API could not be reached or the request timed out."
            : "The API could not provide an operational-status report."
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Platform administration"
        title="Operational status"
        description="Dependency connectivity and worker presence."
        actions={<RefreshButton label="Refresh status" />}
      />

      <HealthReport health={result.data.health} />
    </>
  );
}

export default function AdminHealthPage() {
  return (
    <PageContainer size="medium">
      <BackLink href="/admin">Administration</BackLink>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Checking operational status…
            </p>
          }
        >
          <OperationalHealth />
        </Suspense>
      </div>
    </PageContainer>
  );
}