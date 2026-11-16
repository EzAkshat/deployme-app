"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    isActive: (path: string) => path === "/dashboard",
  },
  {
    href: "/teams",
    label: "Teams",
    isActive: (path: string) =>
      path.startsWith("/teams") || path.startsWith("/invitations"),
  },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main">
      <ul className="flex gap-1">
        {LINKS.map((link) => {
          const active = link.isActive(pathname);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-selected text-foreground"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}