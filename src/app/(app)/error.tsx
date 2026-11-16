"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  // Refetch the server components, then re-render the segment.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <PageContainer>
      <section className="max-w-md rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-xl font-semibold">Unable to load this page</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The service may be temporarily unavailable. Please try again.
        </p>
        <div className="mt-6">
          <Button onClick={retry}>Try again</Button>
        </div>
      </section>
    </PageContainer>
  );
}