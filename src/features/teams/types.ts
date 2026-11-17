export type TeamRole = "OWNER" | "MANAGER" | "MEMBER";

export type Team = {
  id: string;
  name: string;
  slug: string;
  role: TeamRole;
};

export type TeamProject = {
  id: string;
  name: string;
  slug: string;
};

export type TeamMember = {
  id: string;
  role: TeamRole;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
};

export type TeamInvitation = {
  id: string;
  email: string;
  role: "MANAGER" | "MEMBER";
  status: string;
  expiresAt: string;
};

export type InvitationView = TeamInvitation & {
  canRevoke: boolean;
  expiresLabel: string;
};

/** State for create-team and accept-invitation. */
export type TeamActionState = {
  message: string;
  declined?: boolean;
};

/** State for member, invitation, transfer and leave operations. */
export type TeamManagementState = { ok: boolean; message: string };

export type TeamFormAction = (payload: FormData) => void;