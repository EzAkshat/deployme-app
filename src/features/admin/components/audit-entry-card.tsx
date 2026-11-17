import { platformRoleLabel } from "@/features/auth/roles";
import { formatUtcDateTime } from "@/lib/format";
import { auditActionLabel } from "../audit";
import type { AuditEntry } from "../types";

export function AuditEntryCard({ entry }: { entry: AuditEntry }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">{auditActionLabel(entry.action)}</h2>
          <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
            Account: {entry.target.name} (@{entry.target.username})
          </p>
        </div>

        <time dateTime={entry.createdAt} className="text-sm text-muted-foreground">
          {formatUtcDateTime(entry.createdAt)}
        </time>
      </header>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Performed by</dt>
          <dd className="mt-1 [overflow-wrap:anywhere]">
            {entry.actor.name} (@{entry.actor.username})
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">
            Role at the time: {platformRoleLabel(entry.actorPlatformRole)}
          </dd>
        </div>

        <div>
          <dt className="text-sm text-muted-foreground">Previous role</dt>
          <dd className="mt-1">{platformRoleLabel(entry.previousRole)}</dd>
        </div>

        <div>
          <dt className="text-sm text-muted-foreground">New role</dt>
          <dd className="mt-1">{platformRoleLabel(entry.nextRole)}</dd>
        </div>

        <div className="sm:col-span-3">
          <dt className="text-sm text-muted-foreground">Reason</dt>
          <dd className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {entry.reason}
          </dd>
        </div>
      </dl>
    </article>
  );
}