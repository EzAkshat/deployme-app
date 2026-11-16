import { Suspense, type ReactNode } from "react";
import {
  AppHeader,
  AppHeaderFallback,
} from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <Suspense fallback={<AppHeaderFallback />}>
        <AppHeader />
      </Suspense>

      <main id="main">{children}</main>
    </div>
  );
}