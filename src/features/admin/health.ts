import type { HealthStatus, WorkerHealth } from "./types";

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  connected: "Connected",
  unavailable: "Unavailable",
  present: "Present",
  absent: "Absent",
  unknown: "Unknown",
};

export function workerDetail(worker: WorkerHealth): string {
  if (worker.count === null) {
    return "Worker presence could not be determined.";
  }

  return `${worker.count} instance${
    worker.count === 1 ? "" : "s"
  } with an unexpired heartbeat.`;
}