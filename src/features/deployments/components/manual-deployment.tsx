"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requestManualDeployment } from "../manual-deployment-action";
import type { ManualDeploymentState } from "../types";

const INITIAL_STATE: ManualDeploymentState = { message: "", uncertain: false };

export function ManualDeployment({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(
    requestManualDeployment.bind(null, projectId),
    INITIAL_STATE,
  );

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold">Deploy latest commit</h2>

      <p className="text-sm text-muted-foreground">
        Start a new deployment from the production branch using your saved
        build settings. Unsaved settings are not included. Team projects
        require an explicit Deploy grant.
      </p>

      <form action={action}>
        <Button type="submit" disabled={pending || state.uncertain}>
          {pending ? "Requesting deployment…" : "Deploy latest commit"}
        </Button>
      </form>

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}

      {state.uncertain ? (
        <Link
          href={`/projects/${encodeURIComponent(projectId)}`}
          prefetch={false}
          className="inline-block text-sm underline"
        >
          View latest deployments →
        </Link>
      ) : null}
    </section>
  );
}