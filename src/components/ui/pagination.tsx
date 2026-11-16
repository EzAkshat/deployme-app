import Link from "next/link";

interface PaginationProps {
  page: number;
  previousHref: string | null;
  nextHref: string | null;
}

export function Pagination({ page, previousHref, nextHref }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center gap-5 text-sm">
      {previousHref ? (
        <Link prefetch={false} href={previousHref} className="underline">
          Previous
        </Link>
      ) : null}

      <span>Page {page}</span>

      {nextHref ? (
        <Link prefetch={false} href={nextHref} className="underline">
          Next
        </Link>
      ) : null}
    </nav>
  );
}