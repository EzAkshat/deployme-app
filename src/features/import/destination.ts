import "server-only";

export type ImportDestination =
  | { ok: true; team: { id: string; name: string } | null }
  | { ok: false; message: string };

/**
 * Personal imports work now. Team destinations need the team list and
 * roles (owner/manager only), which arrive with the Teams pages.
 */
export async function resolveImportDestination(
  teamId?: string,
): Promise<ImportDestination> {
  if (!teamId) return { ok: true, team: null };

  return {
    ok: false,
    message: "Team destinations are not available yet.",
  };
}