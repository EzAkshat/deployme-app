export interface ActivityResourceUsage {
  status: "unavailable" | "partial" | "complete";
  cpuTimeMs: number | null;
  peakObservedMemoryBytes: number | null;
  expectedExecutionCount: number;
  recordedExecutionCount: number;
  sampleCount: number;
}

export interface ActivityDeployment {
  id: string;
  commitSha: string | null;
  status: string;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  buildStartedAt: string | null;
  buildFinishedAt: string | null;
  artifactSizeBytes?: number | null;
  artifactFileCount?: number | null;
  resourceUsage?: ActivityResourceUsage | null;
}

export interface ActivityLogs extends ActivityDeployment {
  logText: string;
  logBytes: number;
  logTruncated: boolean;
  logUpdatedAt: string | null;
}

export interface ProjectPermissions {
  canView: boolean;
  canDeploy: boolean;
  canManage: boolean;
  canManageSharing: boolean;
}

export interface ProjectDelivery {
  status: string;
  url: string | null;
  liveDeploymentId: string | null;
}

export interface ProjectActivityData {
  project: {
    id: string;
    name: string;
    permissions?: ProjectPermissions;
    delivery: ProjectDelivery;
  };
  latestDeployment: ActivityDeployment | null;
  deployments: ActivityLogs[];
  nextCursor: string | null;
}

type LogPatch = Omit<ActivityLogs, "logText"> & {
  logText?: string;
  logAppend?: string;
  logOffset?: number;
};

export type ActivityUpdate = Omit<ProjectActivityData, "deployments"> & {
  deployments: LogPatch[];
};

export type ManualDeploymentState = {
  message: string;
  uncertain: boolean;
};