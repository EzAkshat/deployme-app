function toneFor(status: string): string {
  if (status === "READY") return "bg-success-bg text-success";
  if (status === "FAILED") return "bg-destructive-bg text-destructive";

  return "bg-surface-secondary text-muted-foreground";
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${toneFor(status)}`}
    >
      {status}
    </span>
  );
}