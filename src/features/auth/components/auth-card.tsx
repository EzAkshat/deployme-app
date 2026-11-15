import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  busy?: boolean;
  children: ReactNode;
}

export function AuthCard({ title, busy = false, children }: AuthCardProps) {
  return (
    <section
      aria-busy={busy}
      className="rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9"
    >
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function AuthCardSkeleton() {
  return (
    <AuthCard title="Welcome to DeployMe" busy>
      <p role="status" className="text-sm text-muted-foreground">
        Checking your session…
      </p>
    </AuthCard>
  );
}