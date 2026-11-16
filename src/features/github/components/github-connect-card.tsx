"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { connectGitHubAction } from "@/features/github/actions";
import type { GitHubConnection } from "@/features/github/types";

export function GitHubConnectCard({
  connection,
}: {
  connection: GitHubConnection;
}) {
  const [state, formAction, pending] = useActionState<{
    message: string;
  } | null>(connectGitHubAction, null);

  return (
    <section className="rounded-xl border border-l-4 border-border border-l-primary bg-surface p-5">
      <form action={formAction}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold [overflow-wrap:anywhere]">
              {connection
                ? `GitHub linked: @${connection.githubLogin}`
                : "Connect your GitHub account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {connection
                ? "Choose a repository when you’re ready to ship."
                : "Connect GitHub to start importing your repositories."}
            </p>
          </div>

          <Button
            type="submit"
            variant={connection ? "secondary" : "primary"}
            disabled={pending}
          >
            {pending
              ? "Opening GitHub…"
              : connection
                ? "Reauthorize GitHub"
                : "Connect GitHub"}
          </Button>
        </div>
      </form>

      {state ? (
        <div className="mt-4">
          <Alert tone="error">{state.message}</Alert>
        </div>
      ) : null}
    </section>
  );
}