import { formatUtcDateTime } from "@/lib/format";
import { workerDetail } from "../health";
import type { AdminHealth } from "../types";
import { StatusCard } from "./status-card";

export function HealthReport({ health }: { health: AdminHealth }) {
  return (
    <>
      <div
        role="status"
        className="mb-6 rounded-xl border border-border bg-surface p-5"
      >
        <p className="font-semibold">
          {health.status === "ready"
            ? "Connectivity and worker-presence checks passed"
            : "One or more checks need attention"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This report does not verify Docker builds, artifact storage, email
          delivery or public website availability.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatusCard
          title="Database"
          status={health.database}
          detail="Checks whether a database query completes successfully."
        />
        <StatusCard
          title="Redis"
          status={health.redis}
          detail="Checks whether Redis responds to a connectivity probe."
        />
        <StatusCard
          title="Deployment workers"
          status={health.workers.deployment.status}
          detail={workerDetail(health.workers.deployment)}
        />
        <StatusCard
          title="Outbox dispatchers"
          status={health.workers.outbox.status}
          detail={workerDetail(health.workers.outbox)}
        />
      </div>

      <footer className="mt-6 space-y-2 text-sm text-muted-foreground">
        <p>
          Report collected:{" "}
          <time dateTime={health.collectedAt}>
            {formatUtcDateTime(health.collectedAt)}
          </time>
        </p>
        <p>
          Probe results may be cached for {health.probeCacheSeconds} second.
          Worker heartbeats expire after {health.heartbeatTtlSeconds} seconds,
          so a stopped worker may briefly remain listed as present.
        </p>
        <p>This page updates when you refresh it.</p>
      </footer>
    </>
  );
}