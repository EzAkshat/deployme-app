type SearchParams = Record<string, string | string[] | undefined>;

export type AuditQuery =
  | { ok: true; before: string | undefined }
  | { ok: false; message: string };

const CURSOR_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_CURSOR_LENGTH = 512;

export function parseAuditQuery(params: SearchParams): AuditQuery {
  const before = params.before;

  if (
    Array.isArray(before) ||
    (before !== undefined &&
      (before.length > MAX_CURSOR_LENGTH || !CURSOR_PATTERN.test(before)))
  ) {
    return { ok: false, message: "The history cursor is invalid." };
  }

  return { ok: true, before };
}

export function auditUrl(before?: string): string {
  if (!before) return "/admin/audit";

  return `/admin/audit?${new URLSearchParams({ before }).toString()}`;
}

const ACTION_LABELS: Record<string, string> = {
  USER_PLATFORM_ROLE_CHANGED: "Platform role changed",
  USER_SUSPENDED: "Account suspended",
  USER_RESTORED: "Account restored",
};

export function auditActionLabel(action: string): string {
  if (Object.hasOwn(ACTION_LABELS, action)) return ACTION_LABELS[action];

  const text = action.replaceAll("_", " ").toLowerCase();

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Status changes show account status instead of platform roles. */
export function isAccountStatusChange(action: string): boolean {
  return action === "USER_SUSPENDED" || action === "USER_RESTORED";
}
