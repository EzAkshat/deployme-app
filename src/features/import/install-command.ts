export const INSTALL_COMMAND_OPTIONS = [
  { value: "", label: "None — finished static files" },
  { value: "npm ci", label: "npm ci" },
  {
    value: "pnpm install --frozen-lockfile",
    label: "pnpm install --frozen-lockfile",
  },
] as const;

export type InstallCommand = (typeof INSTALL_COMMAND_OPTIONS)[number]["value"];

export function isInstallCommand(value: unknown): value is InstallCommand {
  return INSTALL_COMMAND_OPTIONS.some((option) => option.value === value);
}