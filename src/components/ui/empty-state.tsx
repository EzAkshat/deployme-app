import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}