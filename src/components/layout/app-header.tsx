import type { ReactNode } from "react";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getCurrentUser } from "@/lib/server/session";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

function HeaderFrame({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
        <Brand />
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </header>
  );
}

export function AppHeaderFallback() {
  return <HeaderFrame />;
}

// Display only: every page still checks the session itself.
export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderFrame>
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