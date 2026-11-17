import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshButton } from "@/components/ui/refresh-button";
import { AdminNotice } from "@/features/admin/components/admin-notice";
import { AuditEntryCard } from "@/features/admin/components/audit-entry-card";
import { AuditPagination } from "@/features/admin/components/audit-pagination";
import { parseAuditQuery } from "@/features/admin/audit";
import { getAdminAudit } from "@/features/admin/queries";
import { isAdministrator } from "@/features/auth/roles";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = {
  title: "Audit history · Administration",
  robots: { index: false, follow: false },
};

type AuditPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TITLE = "Audit history unavailable";

function failureMessage(status: number): string {
  if (status === 400) return "The history cursor is invalid. Load the latest entries.";
  if (status === 503) {
    return "We could not reach the backend. Please try again shortly.";
  }

  return "We could not load audit history. Please try again shortly.";
}

async function AuditHistory({ searchParams }: AuditPageProps) {
  const user = await requireUser();

  const query = parseAuditQuery(await searchParams);

  if (!query.ok) {
    return (
      <AdminNotice
        title={TITLE}
        message={query.message}
        retryHref="/admin/audit"
        retryLabel="Load latest entries"
      />
    );
  }

  const result = await getAdminAudit(query.before);

  if (!result.ok) {
    if (result.status === 403) {
      // The backend decides access. Administrators who are not super
      // administrators get an explanation; everyone else gets a 404.
      if (!isAdministrator(user)) notFound();

      return (
        <AdminNotice
          title={TITLE}
          message="Super administrator access is required to view this history."
        />
      );
    }

    return (
      <AdminNotice
        title={TITLE}
        message={failureMessage(result.status)}
        retryHref="/admin/audit"
        retryLabel="Load latest entries"
      />
    );
  }

  const { entries, nextCursor } = result.data;

  return (
    <>
      <PageHeader
        eyebrow="Platform administration"
        title="Audit history"
        description="Successful platform-role changes, newest first."
        actions={<RefreshButton label="Refresh" />}
      />

      <p className="mb-6 text-sm text-muted-foreground">
        Account names reflect current profiles. Roles and reasons reflect the
        recorded change. Times are shown in UTC.
      </p>

      {entries.length === 0 ? (
        <EmptyState
          title={query.before ? "No older entries" : "No recorded role changes"}
          description="This history records changes made through the audited role-change service."
        />
      ) : (
        <ol className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <AuditEntryCard entry={entry} />
            </li>
          ))}
        </ol>
      )}

      <AuditPagination
        isLatest={query.before === undefined}
        nextCursor={nextCursor}
      />
    </>
  );
}

export default function AdminAuditPage(props: AuditPageProps) {
  return (
    <PageContainer size="medium">
      <BackLink href="/admin">Administration</BackLink>

      <div className="mt-6">
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading audit history…
            </p>
          }
        >
          <AuditHistory {...props} />
        </Suspense>
      </div>
    </PageContainer>
  );
}