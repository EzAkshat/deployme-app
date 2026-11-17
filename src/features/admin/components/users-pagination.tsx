import { LinkButton } from "@/components/ui/link-button";
import { usersUrl } from "../query";

interface UsersPaginationProps {
  search: string;
  isFirstPage: boolean;
  nextCursor: string | null;
}

export function UsersPagination({
  search,
  isFirstPage,
  nextCursor,
}: UsersPaginationProps) {
  return (
    <nav
      aria-label="User directory pagination"
      className="mt-6 flex flex-wrap items-center justify-between gap-3"
    >
      {isFirstPage ? (
        <span className="text-sm text-muted-foreground">First page</span>
      ) : (
        <LinkButton href={usersUrl(search)} prefetch={false} variant="secondary">
          First page
        </LinkButton>
      )}

      {nextCursor !== null ? (
        <LinkButton
          href={usersUrl(search, nextCursor)}
          prefetch={false}
          variant="secondary"
        >
          Next page →
        </LinkButton>
      ) : (
        <span className="text-sm text-muted-foreground">End of results</span>
      )}
    </nav>
  );
}