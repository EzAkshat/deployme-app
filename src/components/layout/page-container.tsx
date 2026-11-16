import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      {children}
    </div>
  );
}