type FrameworkName =
  | "vite"
  | "astro"
  | "next"
  | "nuxt"
  | "sveltekit"
  | "angular"
  | "custom";

export type DetectedProjectType =
  | "static"
  | "unknown"
  | `npm-${FrameworkName}`
  | `pnpm-${FrameworkName}`;

const PROJECT_TYPE_LABELS: Record<DetectedProjectType, string> = {
  static: "Static website",
  unknown: "Needs manual configuration",
  "npm-vite": "Vite with npm",
  "pnpm-vite": "Vite with pnpm",
  "npm-astro": "Astro with npm",
  "pnpm-astro": "Astro with pnpm",
  "npm-next": "Next.js static export with npm",
  "pnpm-next": "Next.js static export with pnpm",
  "npm-nuxt": "Nuxt static generation with npm",
  "pnpm-nuxt": "Nuxt static generation with pnpm",
  "npm-sveltekit": "SvelteKit static build with npm",
  "pnpm-sveltekit": "SvelteKit static build with pnpm",
  "npm-angular": "Angular frontend with npm",
  "pnpm-angular": "Angular frontend with pnpm",
  "npm-custom": "Custom frontend with npm",
  "pnpm-custom": "Custom frontend with pnpm",
};

export function projectTypeLabel(value: string): string {
  return Object.hasOwn(PROJECT_TYPE_LABELS, value)
    ? PROJECT_TYPE_LABELS[value as DetectedProjectType]
    : PROJECT_TYPE_LABELS.unknown;
}