import type { TeamMember, TeamRole } from "./types";

/** Owners and managers can invite, revoke and import team projects. */
export function canManageTeam(role: TeamRole): boolean {
  return role === "OWNER" || role === "MANAGER";
}

export function countOwners(members: TeamMember[]): number {
  return members.filter((member) => member.role === "OWNER").length;
}

export function isLastOwner(member: TeamMember, ownerCount: number): boolean {
  return member.role === "OWNER" && ownerCount === 1;
}

/** Only owners change roles, and never the last owner's. */
export function canChangeRole(
  currentRole: TeamRole,
  member: TeamMember,
  ownerCount: number,
): boolean {
  return currentRole === "OWNER" && !isLastOwner(member, ownerCount);
}

/** Owners remove other eligible members; managers remove ordinary members. */
export function canRemoveMember({
  currentRole,
  currentUserId,
  member,
  ownerCount,
}: {
  currentRole: TeamRole;
  currentUserId: number;
  member: TeamMember;
  ownerCount: number;
}): boolean {
  return (
    member.user.id !== currentUserId &&
    !isLastOwner(member, ownerCount) &&
    (currentRole === "OWNER" ||
      (currentRole === "MANAGER" && member.role === "MEMBER"))
  );
}