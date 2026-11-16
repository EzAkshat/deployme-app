export type ProjectAccessMember = {
  role: "OWNER" | "MANAGER" | "MEMBER";
  user: {
    id: number;
    name: string;
    username: string;
  };
  share: {
    userId: number;
    canView: boolean;
    canDeploy: boolean;
    canManage: boolean;
  } | null;
};

export type ProjectAccessData = {
  project: {
    id: string;
    name: string;
    teamId: string;
  };
  members: ProjectAccessMember[];
};

export type ProjectAccessState = {
  ok: boolean;
  message: string;
};