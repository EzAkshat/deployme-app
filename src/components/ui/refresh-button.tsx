"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "./button";

interface RefreshButtonProps {
  label?: string;
  pendingLabel?: string;
}

/** Re-runs the server components of the current page. */
export function RefreshButton({
  label = "Refresh",
  pendingLabel = "Refreshing…",
}: RefreshButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          router.refresh();
        })
      }
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}