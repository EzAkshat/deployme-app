import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">
      {children}
    </span>
  );
}