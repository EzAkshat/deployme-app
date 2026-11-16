import Link from "next/link";
import type { TeamProject } from "../types";

export function TeamProjectCard({ project }: { project: TeamProject }) {
  return (
    <article className="space-y-3 rounded-xl border border-border bg-surface p-5">
      <h3 className="font-semibold [overflow-wrap:anywhere]">{project.name}</h3>
      <p className="text-sm break-all text-muted-foreground">{project.slug}</p>
      <Link
        href={`/projects/${encodeURIComponent(project.id)}`}
        prefetch={false}
        className="inline-block text-sm font-medium text-primary"
      >
        View project →
      </Link>
    </article>
  );
}