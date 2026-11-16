import "server-only";

import { notFound, redirect } from "next/navigation";
import { backendRequest } from "@/lib/server/backend";
import { getBackendJson } from "@/lib/server/backend-json";
import type {
  Team,
  TeamInvitation,
  TeamMember,
  TeamProject,
} from "./types";

const encode = encodeURIComponent;

export async function getMyTeams(): Promise<Team[]> {
  const data = await getBackendJson<{ teams: Team[] }>(
    "/teams",
    "Unable to load your teams. Please retry.",
  );

  return data.teams;
}

/** The team, if the person belongs to it; otherwise a 404. */
export async function getTeam(teamId: string): Promise<Team> {
  const team = (await getMyTeams()).find((item) => item.id === teamId);

  if (!team) notFound();

  return team;
}

export async function getTeamProjects(teamId: string): Promise<TeamProject[]> {
  const data = await getBackendJson<{ projects: TeamProject[] }>(
    `/projects/teams/${encode(teamId)}/projects`,
    "Unable to load team projects. Please retry.",
    { notFoundOn: [403, 404] },
  );

  return data.projects;
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const data = await getBackendJson<{ members: TeamMember[] }>(
    `/teams/${encode(teamId)}/members`,
    "Unable to load team members or invitations. Please retry.",
    { notFoundOn: [403, 404] },
  );

  return data.members;
}

/** Also returns the backend's response time, used to judge expiry. */
export async function getTeamInvitations(teamId: string): Promise<{
  invitations: TeamInvitation[];
  serverTime: number;
}> {
  const response = await backendRequest(`/teams/${encode(teamId)}/invitations`);

  if (response.status === 401) redirect("/login");
  if (response.status === 403 || response.status === 404) notFound();

  if (!response.ok) {
    throw new Error("Unable to load team members or invitations. Please retry.");
  }

  const data = (await response.json()) as { invitations: TeamInvitation[] };

  return {
    invitations: data.invitations,
    serverTime: Date.parse(response.headers.get("date") ?? ""),
  };
}