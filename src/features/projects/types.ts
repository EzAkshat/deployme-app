export interface Project {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  createdAt: string;
}

export interface ResourceUsage {
  status: "unavailable" | "partial" | "complete";
  cpuTimeMs: number | null;
  peakObservedMemoryBytes: number | null;
  expectedExecutionCount: number;
  recordedExecutionCount: number;
  sampleCount: number;
}

export interface Deployment {
  id: string;
  commitSha: string;
  status: string;
  failureReason: string | null;
  createdAt: string;
  buildElapsedMs: number | null;
  artifactSizeBytes?: number | null;
  artifactFileCount?: number | null;
  resourceUsage?: ResourceUsage | null;
}

export interface DeploymentOverview {
  recentDeployments: Deployment[];
}