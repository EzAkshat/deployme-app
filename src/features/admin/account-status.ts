export type AccountStatus = "Active" | "Suspended" | "Unknown";

/** `undefined` means the backend did not report a status. */
export function accountStatusLabel(
  suspendedAt: string | null | undefined,
): AccountStatus {
  if (suspendedAt === undefined) return "Unknown";

  return suspendedAt === null ? "Active" : "Suspended";
}