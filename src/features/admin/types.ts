import type { PlatformRole } from "@/features/auth/types";

export type AdminUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  createdAt: string;
  onboardingCompletedAt: string | null;
  suspendedAt?: string | null;
  accountStateVersion?: number;
};

export type AdminUsersPage = {
  users: AdminUser[];
  nextCursor: string | null;
};

export type ChangeRoleInput = {
  userId: number;
  expectedRole: "USER" | "SITE_ADMIN";
  nextRole: "USER" | "SITE_ADMIN";
  previousSuspendedAt?: string | null;
  nextSuspendedAt?: string | null;
  reason: string;
};

export type ChangeRoleResult =
  | { ok: true; changed: boolean }
  | { ok: false; status: number; message: string };

export type AuditAccount = {
  id: number;
  username: string;
  name: string;
};

export type AuditEntry = {
  id: string;
  action: string;
  actorPlatformRole: PlatformRole;
  previousRole: PlatformRole;
  nextRole: PlatformRole;
  previousSuspendedAt?: string | null;
  nextSuspendedAt?: string | null;
  reason: string;
  createdAt: string;
  actor: AuditAccount;
  target: AuditAccount;
};

export type AuditPage = {
  entries: AuditEntry[];
  nextCursor: string | null;
};

export type HealthStatus =
  | "connected"
  | "unavailable"
  | "present"
  | "absent"
  | "unknown";

export type WorkerHealth = {
  status: "present" | "absent" | "unknown";
  count: number | null;
};

export type AdminHealth = {
  collectedAt: string;
  status: "ready" | "not_ready";
  scope: "dependency_connectivity_and_worker_presence";
  probeCacheSeconds: number;
  heartbeatTtlSeconds: number;
  database: "connected" | "unavailable";
  redis: "connected" | "unavailable";
  workers: {
    deployment: WorkerHealth;
    outbox: WorkerHealth;
  };
};

export type ChangeStatusInput = {
  userId: number;
  expectedVersion: number;
  suspended: boolean;
  reason: string;
};

export type ChangeStatusResult = {
  ok: boolean;
  message: string;
  refreshRequired: boolean;
};

export type AdminDeploymentStatus =
  | "PENDING"
  | "QUEUED"
  | "BUILDING"
  | "READY"
  | "FAILED"
  | "CANCELLED";

export type AdminOverview = {
  generatedAt: string;
  users: {
    total: number;
  };
  teams: {
    total: number;
  };
  projects: {
    total: number;
    active: number;
    archived: number;
  };
  deployments: {
    total: number;
    byStatus: {
      status: AdminDeploymentStatus;
      count: number;
    }[];
  };
};