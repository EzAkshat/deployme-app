"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
  isActive: (path: string) => boolean;
};

const LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    isActive: (path) => path === "/dashboard",
  },
  {
    href: "/teams",
    label: "Teams",
    isActive: (path) =>
      path.startsWith("/teams") || path.startsWith("/invitations"),
  },
];

const ADMIN_LINK: NavLink = {
  href: "/admin",
  label: "Administration",
  isActive: (path) => path.startsWith("/admin"),
};

export function NavLinks({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();
  const links = showAdmin ? [...LINKS, ADMIN_LINK] : LINKS;

  return (
    <nav aria-label="Main">
      <ul className="flex gap-1">
        {links.map((link) => {
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