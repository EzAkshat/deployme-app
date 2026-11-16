import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon />
      {children}
    </Link>
  );
}