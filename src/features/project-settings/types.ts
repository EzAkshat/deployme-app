export type ProjectSettings = {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  rootDirectory: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  spaFallback: boolean;
  gitRepository: {
    owner: string;
    name: string;
    defaultBranch: string;
    productionBranch: string;
  } | null;
    publicBuildVariables?: Record<string, string>;
};

export type BuildSettingsValues = {
  rootDirectory: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  spaFallback: boolean;
    publicBuildVariables?: Record<string, string>;
};

export type SettingsState = {
  ok: boolean;
  message: string;
  archived?: boolean;
};