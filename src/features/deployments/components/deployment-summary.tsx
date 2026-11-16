import { StatusBadge } from "@/components/ui/status-badge";
import { formatIndiaTime } from "../format";
import type { ActivityDeployment } from "../types";

const DESCRIPTIONS: Record<string, string> = {
  PENDING: "Waiting to dispatch this deployment.",
  QUEUED: "Waiting for a build worker.",
  BUILDING: "Building your website.",
  READY: "Build completed. Public delivery is shown separately below.",
  FAILED: "Deployment failed. See the logs and failure reason.",
  CANCELLED: "Deployment cancelled.",
};

function buildDurationMs(deployment: ActivityDeployment): number | null {
  if (!deployment.buildStartedAt || !deployment.buildFinishedAt) return null;

  const duration = Math.max(
    0,
    Date.parse(deployment.buildFinishedAt) -
      Date.parse(deployment.buildStartedAt),
  );

  return Number.isFinite(duration) ? duration : null;
}

export function DeploymentSummary({
  deployment,
}: {
  deployment: ActivityDeployment;
}) {
  const duration = buildDurationMs(deployment);

  return (
    <section aria-label="Deployment status" className="space-y-5">
      <div role="status" className="space-y-2">
        <StatusBadge status={deployment.status} />
        <p>{DESCRIPTIONS[deployment.status] ?? deployment.status}</p>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Commit</dt>
          <dd className="mt-1 font-mono">
            {deployment.commitSha?.slice(0, 7) ?? "Unavailable"}
          </dd>
        </div>

        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="mt-1">{formatIndiaTime(deployment.createdAt)}</dd>
        </div>

        {duration !== null ? (
          <div>
            <dt className="text-muted-foreground">Build duration</dt>
            <dd className="mt-1">{(duration / 1000).toFixed(1)} seconds</dd>
          </div>
        ) : null}
      </dl>

      {deployment.failureReason ? (
        <p
          role="alert"
          className="text-sm whitespace-pre-wrap text-destructive [overflow-wrap:anywhere]"
        >
          {deployment.failureReason}
        </p>
      ) : null}
    </section>
  );
}