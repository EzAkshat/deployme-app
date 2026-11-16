export type GitHubInstallation = {
  installationId: number;
  accountLogin: string | null;
  accountType: string | null;
  repositorySelection: "all" | "selected";
  suspended: boolean;
};

export type GitHubRepository = {
  repositoryId: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string | null;
  htmlUrl: string;
  archived: boolean;
  disabled: boolean;
};

export type InstallationList = {
  installations: GitHubInstallation[];
  totalCount: number;
  nextPage: number | null;
};

export type RepositoryList = {
  installationId: number;
  repositories: GitHubRepository[];
  totalCount: number;
  nextPage: number | null;
};

export type GitHubInspection = {
  installationId: number;
  repositoryId: number;
  defaultBranch: string;
  commitSha: string;
  rootDirectory: string;
  fileNames: string[];
  folders: string[];
  projectType: "static" | "npm-vite" | "unknown";
  requiresReview: boolean;
  reasons: string[];
  settings: {
    installCommand: string;
    buildCommand: string;
    outputDirectory: string;
    spaFallback: boolean;
  } | null;
};

export type InspectionState = {
  error: string;
  inspection: GitHubInspection | null;
};

export type BuildSettings = {
  installCommand: "" | "npm ci";
  buildCommand: string;
  outputDirectory: string;
  spaFallback: boolean;
};

export type DeployProjectInput = {
  name: string;
  slug: string;
  subdomain: string;
  installationId: number;
  repositoryId: number;
  owner: string;
  repositoryName: string;
  commitSha: string;
  rootDirectory: string;
  installCommand: "" | "npm ci";
  buildCommand: string;
  outputDirectory: string;
  spaFallback: boolean;
  settingsReviewed: boolean;
  teamId?: string;
  grantCreatorDeploy?: boolean;
};

export type DeployProjectResult =
  | {
      ok: true;
      project: { id: string; name: string };
      deployment: { id: string; status: string };
    }
  | {
      ok: false;
      message: string;
      uncertain: boolean;
    };