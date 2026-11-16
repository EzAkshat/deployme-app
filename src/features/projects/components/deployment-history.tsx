import { Suspense } from "react";
import { Alert } from "@/components/ui/alert";
import { RefreshButton } from "@/components/ui/refresh-button";
import { getDeploymentOverview } from "../queries";
import type { Project } from "../types";
import { DeploymentTable } from "./deployment-table";

async function DeploymentHistoryBody({ project }: { project: Project }) {
  const overview = await getDeploymentOverview(project.id);

  if (overview === null) {
    return (
      <Alert tone="error">
        Unable to load deployment history. Use “Refresh deployments” to try
        again.
      </Alert>
    );
  }

  if (overview.recentDeployments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This project has no deployments yet.
      </p>
    );
  }

  return (
    <DeploymentTable
      projectId={project.id}
      deployments={overview.recentDeployments}
    />
  );
}

export function DeploymentHistory({ project }: { project: Project }) {
  return (
    <section
      id="deployment-history"
      aria-labelledby="deployment-history-title"
      className="mt-8 scroll-mt-6 rounded-xl border border-border bg-surface p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="deployment-history-title"
            className="text-lg font-semibold [overflow-wrap:anywhere]"
          >
            {project.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest 20 deployments · Refresh to update
          </p>
        </div>
        <RefreshButton label="Refresh deployments" />
      </div>

      <div className="mt-5">
        <Suspense
          key={project.id}
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading deployment history…
            </p>
          }
        >
          <DeploymentHistoryBody project={project} />
        </Suspense>
      </div>
    </section>
  );
}