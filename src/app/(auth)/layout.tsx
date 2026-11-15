import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
            D
          </span>
          <p className="mt-3 text-lg font-semibold tracking-tight">DeployMe</p>
        </div>

        {children}

        <p className="mt-6 text-center text-xs text-subtle-foreground">
          From your repository to the web.
        </p>
      </div>
    </main>
  );
}