import { HEALTH_LABELS } from "../health";
import type { HealthStatus } from "../types";

function toneFor(status: HealthStatus): string {
  if (status === "connected" || status === "present") return "text-success";
  if (status === "unknown") return "text-muted-foreground";

  return "text-destructive";
}

interface StatusCardProps {
  title: string;
  status: HealthStatus;
  detail: string;
}

export function StatusCard({ title, status, detail }: StatusCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className={`mt-3 text-xl font-semibold ${toneFor(status)}`}>
        {HEALTH_LABELS[status]}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}