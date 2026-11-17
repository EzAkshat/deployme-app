import { LinkButton } from "@/components/ui/link-button";
import { auditUrl } from "../audit";

interface AuditPaginationProps {
  isLatest: boolean;
  nextCursor: string | null;
}

export function AuditPagination({ isLatest, nextCursor }: AuditPaginationProps) {
  return (
    <nav
      aria-label="Audit history pagination"
      className="mt-6 flex flex-wrap items-center justify-between gap-3"
    >
      {isLatest ? (
        <span className="text-sm text-muted-foreground">Latest entries</span>
      ) : (
        <LinkButton href="/admin/audit" prefetch={false} variant="secondary">
          Latest entries
        </LinkButton>
      )}

      {nextCursor ? (
        <LinkButton
          href={auditUrl(nextCursor)}
          prefetch={false}
          variant="secondary"
        >
          Older entries →
        </LinkButton>
      ) : (
        <span className="text-sm text-muted-foreground">End of history</span>
      )}
    </nav>
  );
}