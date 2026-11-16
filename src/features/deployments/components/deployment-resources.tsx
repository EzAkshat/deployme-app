import { formatBytes, formatMilliseconds } from "@/lib/format";
import type { ActivityDeployment } from "../types";

export function DeploymentResources({
  deployment,
}: {
  deployment: ActivityDeployment;
}) {
  const usage = deployment.resourceUsage;
  const available = usage?.status === "partial" || usage?.status === "complete";
  const fileCount = deployment.artifactFileCount;

  return (
    <section
      aria-label="Deployment resource usage"
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-lg font-semibold">Deployment resource usage</h2>

      <dl className="grid gap-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">CPU time</dt>
          <dd className="mt-1 font-semibold">
            {formatMilliseconds(available ? usage.cpuTimeMs : null)}
          </dd>
        </div>

        <div>
          <dt className="text-muted-foreground">Peak observed memory</dt>
          <dd className="mt-1 font-semibold">
            {formatBytes(available ? usage.peakObservedMemoryBytes : null)}
          </dd>
        </div>

        <div>
          <dt className="text-muted-foreground">Artifact size</dt>
          <dd className="mt-1 font-semibold">
            {formatBytes(deployment.artifactSizeBytes)}
          </dd>

          {typeof fileCount === "number" &&
          Number.isSafeInteger(fileCount) &&
          fileCount >= 0 ? (
            <dd className="mt-1 text-xs text-muted-foreground">
              {fileCount} files
            </dd>
          ) : null}
        </div>
      </dl>

      <p className="text-sm">
        Measurement coverage:{" "}
        <strong>
          {usage?.status === "complete"
            ? "Complete"
            : usage?.status === "partial"
              ? "Partial"
              : "Unavailable"}
        </strong>
        {usage && available ? (
          <>
            {" · "}
            {usage.recordedExecutionCount}/{usage.expectedExecutionCount}{" "}
            executions recorded
            {" · "}
            {usage.sampleCount} samples
          </>
        ) : null}
      </p>

      <p className="text-xs text-muted-foreground">
        These measurements describe deployment execution, not ongoing website
        usage. CPU time includes recorded retries; memory is the highest
        observed sample. Partial measurements may omit execution data. Artifact
        size is this deployment’s output, not total project storage.
      </p>
    </section>
  );
}