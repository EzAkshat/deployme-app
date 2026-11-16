import { Suspense, type ReactNode } from "react";
import {
  AppHeader,
  AppHeaderFallback,
} from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<AppHeaderFallback />}>
        <AppHeader />
      </Suspense>
      {children}
    </div>
  );
}