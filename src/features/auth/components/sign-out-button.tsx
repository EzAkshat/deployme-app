"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function signOut() {
    setError("");

    startTransition(async () => {
      const result = await logoutAction();

      if (!result.ok) {
        setError(result.message);
        return;
      }

      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <>
      {error ? (
        <span role="alert" className="max-w-xs text-sm text-destructive">
          {error}
        </span>
      ) : null}
      <Button variant="secondary" disabled={pending} onClick={signOut}>
        {pending ? "Signing out…" : "Sign out"}
      </Button>
    </>
  );
}