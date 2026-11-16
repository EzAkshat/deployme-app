import Link from "next/link";
import { LocalTime } from "@/components/ui/local-time";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBytes, formatMilliseconds } from "@/lib/format";
import type { Deployment } from "../types";

function ResourceCells({ deployment }: { deployment: Deployment }) {
  const usage = deployment.resourceUsage;
  const available =
    usage?.status === "partial" || usage?.status === "complete";
  const fileCount = deployment.artifactFileCount;

  return (
    <>
      <td className="py-4 pr-4 align-top whitespace-nowrap">
        {formatMilliseconds(available ? usage.cpuTimeMs : null)}
      </td>

      <td className="py-4 pr-4 align-top whitespace-nowrap">
        {formatBytes(available ? usage.peakObservedMemoryBytes : null)}
      </td>

      <td className="py-4 pr-4 align-top whitespace-nowrap">
        {formatBytes(deployment.artifactSizeBytes)}
        {typeof fileCount === "number" &&
        Number.isSafeInteger(fileCount) &&
        fileCount >= 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {fileCount} files
          </p>
        ) : null}
      </td>

      <td className="py-4 align-top">
        <span
          className={
            usage?.status === "complete"
              ? "text-success"
              : "text-muted-foreground"
          }
        >
          {usage?.status === "complete"
            ? "Complete"
            : usage?.status === "partial"
              ? "Partial"
              : "Unavailable"}
        </span>

        {usage && available ? (
          <p className="mt-1 text-xs whitespace-nowrap text-muted-foreground">
            {usage.recordedExecutionCount}/{usage.expectedExecutionCount}{" "}
            executions recorded
            <br />
            {usage.sampleCount} samples
          </p>
        ) : null}
      </td>
    </>
  );
}

export function DeploymentTable({
  projectId,
  deployments,
}: {
  projectId: string;
  deployments: Deployment[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="pb-4 text-left text-xs text-muted-foreground">
          Deployment execution measurements, not ongoing website usage. CPU
          time includes recorded retries; memory is the highest observed
          sample. Partial measurements may omit execution data. Artifact size
          describes this deployment’s output, not total project storage.
        </caption>
        <thead className="border-b border-border text-muted-foreground">
          <tr>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 pr-4 font-medium">Commit</th>
            <th className="py-3 pr-4 font-medium">Requested</th>
            <th className="py-3 pr-4 font-medium">Build duration</th>
            <th className="py-3 pr-4 font-medium">CPU time</th>
            <th className="py-3 pr-4 font-medium">Peak observed memory</th>
            <th className="py-3 pr-4 font-medium">Artifact size</th>
            <th className="py-3 font-medium">Measurement coverage</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((deployment) => (
            <tr
              key={deployment.id}
              className="border-b border-border last:border-0"
            >
              <td className="py-4 pr-4 align-top">
                <StatusBadge status={deployment.status} />
                {deployment.failureReason ? (
                  <p className="mt-1 max-w-sm text-xs text-destructive [overflow-wrap:anywhere]">
                    {deployment.failureReason}
                  </p>
                ) : null}
              </td>
              <td className="py-4 pr-4 align-top font-mono">
                <Link
                  className="underline"
                  href={`/projects/${encodeURIComponent(projectId)}?deployment=${encodeURIComponent(deployment.id)}`}
                  prefetch={false}
                >
                  {deployment.commitSha.slice(0, 7)}
                </Link>
              </td>
              <td className="py-4 pr-4 align-top whitespace-nowrap">
                <LocalTime value={deployment.createdAt} />
              </td>
              <td className="py-4 pr-4 align-top whitespace-nowrap">
                {formatMilliseconds(deployment.buildElapsedMs)}
              </td>
              <ResourceCells deployment={deployment} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}