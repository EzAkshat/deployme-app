import type { Ref, UIEventHandler } from "react";
import { formatIndiaTime, formatProjectLogs } from "../format";
import type { ActivityLogs } from "../types";

interface LogViewerProps {
  ref: Ref<HTMLDivElement>;
  deployments: ActivityLogs[];
  onScroll: UIEventHandler<HTMLDivElement>;
}

export function LogViewer({ ref, deployments, onScroll }: LogViewerProps) {
  return (
    <div
      ref={ref}
      role="region"
      tabIndex={0}
      aria-label="Project build logs"
      onScroll={onScroll}
      className="max-h-[65vh] overflow-auto rounded-xl bg-log p-4 text-log-foreground"
    >
      {deployments.length === 0 ? <p>No logs on this page.</p> : null}

      {[...deployments].reverse().map((row) => (
        <section key={row.id} className="mb-6 last:mb-0">
          <h3 className="mb-3 font-mono text-sm font-semibold whitespace-pre-wrap text-log-accent [overflow-wrap:anywhere]">
            ── [{formatIndiaTime(row.createdAt)}] Deployment · commit{" "}
            {row.commitSha?.slice(0, 7) ?? "unknown"} ──
          </h3>

          <p className="mb-2 text-xs text-log-muted [overflow-wrap:anywhere]">
            {row.status} · Deployment {row.id}
            {row.logUpdatedAt
              ? ` · Logs updated ${formatIndiaTime(row.logUpdatedAt)}`
              : null}
          </p>

          <pre className="font-mono text-xs/6 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {row.logText
              ? formatProjectLogs(row.logText)
              : "No build output recorded yet."}
          </pre>

          {row.failureReason ? (
            <p className="mt-2 text-sm text-log-danger">{row.failureReason}</p>
          ) : null}

          {row.logTruncated ? (
            <p className="mt-2 text-sm text-log-warning">
              Output was truncated at the backend’s 256 KiB limit. Additional
              output was not stored.
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}