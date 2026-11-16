import "server-only";

import { canManageTeam } from "@/features/teams/permissions";
import { getMyTeams } from "@/features/teams/queries";

export type ImportDestination =
  | { ok: true; team: { id: string; name: string } | null }
  | { ok: false; message: string };

/** Personal by default; a team only for its owners and managers. */
export async function resolveImportDestination(
  teamId?: string,
): Promise<ImportDestination> {
  if (!teamId) return { ok: true, team: null };

  const team = (await getMyTeams()).find((item) => item.id === teamId);

  if (!team || !canManageTeam(team.role)) {
    return {
      ok: false,
      message: "The team is unavailable or you cannot import projects into it.",
    };
  }

  return { ok: true, team: { id: team.id, name: team.name } };
}