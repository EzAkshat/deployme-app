"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { useActivityStream } from "../hooks/use-activity-stream";
import type { ProjectActivityData } from "../types";
import { DeploymentResources } from "./deployment-resources";
import { DeploymentSummary } from "./deployment-summary";
import { LogViewer } from "./log-viewer";
import { ManualDeployment } from "./manual-deployment";
import { WebsiteDelivery } from "./website-delivery";

interface ProjectActivityProps {
  initial: ProjectActivityData;
  query: string;
  pinned: boolean;
  historical: boolean;
}

export function ProjectActivity({
  initial,
  query,
  pinned,
  historical,
}: ProjectActivityProps) {
  const {
    data,
    connection,
    accessLost,
    hasPendingUpdates,
    reconnect,
    showLatestOutput,
    viewerRef,
    handleViewerScroll,
  } = useActivityStream(initial, query);

  const projectId = initial.project.id;
  const projectHref = `/projects/${encodeURIComponent(projectId)}`;
  const permissions = data.project.permissions;

  const deployment = pinned
    ? (data.deployments[0] ?? null)
    : data.latestDeployment;

  const headerActions =
    permissions?.canManage || permissions?.canManageSharing ? (
      <>
        {permissions.canManage ? (
          <LinkButton
            href={`${projectHref}/settings`}
            prefetch={false}
            variant="secondary"
          >
            Project settings
          </LinkButton>
        ) : null}
        {permissions.canManageSharing ? (
          <LinkButton
            href={`${projectHref}/access`}
            prefetch={false}
            variant="secondary"
          >
            Project access
          </LinkButton>
        ) : null}
      </>
    ) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={pinned ? "Deployment details" : "Project activity"}
        title={data.project.name}
        actions={headerActions}
      />

      {permissions?.canDeploy && !pinned && !historical ? (
        <ManualDeployment projectId={projectId} />
      ) : null}

      {deployment ? (
        <>
          <DeploymentSummary deployment={deployment} />
          <DeploymentResources deployment={deployment} />
        </>
      ) : (
        <p>
          No deployments yet. New deployments will appear here automatically.
        </p>
      )}

      <WebsiteDelivery
        delivery={data.project.delivery}
        inspected={deployment}
      />

      <section aria-labelledby="logs-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="logs-title" className="text-lg font-semibold">
            {pinned ? "Deployment logs" : "Project build logs"}
          </h2>
          <span className="text-sm text-muted-foreground">
            All times: IST · 24-hour clock
          </span>
        </div>

        <p role="status" className="text-sm text-muted-foreground">
          {connection}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <button
            type="button"
            className="cursor-pointer underline hover:text-primary"
            onClick={reconnect}
          >
            Reconnect updates
          </button>

          {accessLost ? (
            <Link className="underline hover:text-primary" href="/login">
              Sign in
            </Link>
          ) : null}

          {pinned || historical ? (
            <Link
              className="underline hover:text-primary"
              prefetch={false}
              href={projectHref}
            >
              Latest project logs
            </Link>
          ) : null}

          {data.nextCursor ? (
            <Link
              className="underline hover:text-primary"
              prefetch={false}
              href={`${projectHref}?before=${encodeURIComponent(data.nextCursor)}`}
            >
              Older deployments →
            </Link>
          ) : null}
        </div>

        {hasPendingUpdates ? (
          <Button onClick={showLatestOutput}>
            New updates — show latest output
          </Button>
        ) : null}

        <LogViewer
          ref={viewerRef}
          deployments={data.deployments}
          onScroll={handleViewerScroll}
        />

        <p className="text-xs text-muted-foreground">
          Up to five deployments per page, oldest first within this page. Use
          Older deployments for earlier history. Updates arrive without
          refreshing the page.
        </p>
      </section>
    </div>
  );
}