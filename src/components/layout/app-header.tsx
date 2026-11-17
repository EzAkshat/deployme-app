import type { ReactNode } from "react";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getCurrentUser } from "@/lib/server/session";
import { Brand } from "./brand";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { isAdministrator } from "@/features/auth/roles";

interface HeaderFrameProps {
  nav?: ReactNode;
  children?: ReactNode;
}

function HeaderFrame({ nav, children }: HeaderFrameProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2 sm:px-8">
        <Brand />

        {/* Own row on narrow screens, inline from sm up. */}
        <div className="order-last w-full sm:order-none sm:w-auto">{nav}</div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}

export function AppHeaderFallback() {
  return <HeaderFrame />;
}

// Display only: every page still checks the session itself.
export async function AppHeader() {
  // Display only: a failed session check must not take the whole page down.
  const user = await getCurrentUser().catch(() => null);

  return (
    <HeaderFrame nav={user ? <NavLinks showAdmin={isAdministrator(user)} /> : null}>
      {user ? (
        <span
          className="max-w-48 truncate text-sm text-muted-foreground"
          title={user.name}
        >
          {user.name}
        </span>
      ) : null}
      <ThemeToggle />
      {user ? <SignOutButton /> : null}
    </HeaderFrame>
  );
}