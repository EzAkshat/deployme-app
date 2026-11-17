import "server-only";

import { readBackend } from "@/lib/server/read-backend";
import type {
  AdminUsersPage,
  AuditPage,
  AdminHealth,
  AdminOverview,
} from "./types";

export function getAdminUsers(search: string, after?: string) {
  const query = new URLSearchParams();

  if (search) query.set("search", search);
  if (after) query.set("after", after);

  const suffix = query.toString();

  return readBackend<AdminUsersPage>(
    `/admin/users${suffix ? `?${suffix}` : ""}`,
  );
}

export function getAdminAudit(before?: string) {
  const suffix = before ? `?${new URLSearchParams({ before }).toString()}` : "";

  return readBackend<AuditPage>(`/admin/audit${suffix}`);
}

const HEALTH_TIMEOUT_MS = 10_000;

export function getAdminHealth() {
  return readBackend<{ health: AdminHealth }>("/admin/health", {
    timeoutMs: HEALTH_TIMEOUT_MS,
  });
}

export function getAdminOverview() {
  return readBackend<{ overview: AdminOverview }>("/admin/overview");
}