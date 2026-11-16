import type { GitHubInspection } from "./types";

type ProjectType = GitHubInspection["projectType"];

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  static: "Static website",
  "npm-vite": "Vite with npm",
  "npm-astro": "Astro — static output requires review",
  "npm-next": "Next.js — static export requires review",
  "npm-nuxt": "Nuxt — static generation requires review",
  "npm-sveltekit": "SvelteKit — static adapter requires review",
  "npm-angular": "Angular — browser output requires review",
  "npm-custom": "Custom frontend build",
  unknown: "Needs manual configuration",
};

export function projectTypeLabel(value: string): string {
  return Object.hasOwn(PROJECT_TYPE_LABELS, value)
    ? PROJECT_TYPE_LABELS[value as ProjectType]
    : PROJECT_TYPE_LABELS.unknown;
}