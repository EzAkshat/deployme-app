import Link from "next/link";
import type { Project } from "../types";

export function ProjectCard({
  project,
  selected,
}: {
  project: Project;
  selected: boolean;
}) {
  const projectHref = `/projects/${encodeURIComponent(project.id)}`;
  const historyHref = selected
    ? "/dashboard"
    : `/dashboard?history=${encodeURIComponent(project.id)}#deployment-history`;

  return (
    <article
      className={`flex min-w-0 flex-col rounded-xl border bg-surface p-6 transition-colors ${
        selected ? "border-primary" : "border-border hover:border-border-strong"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle font-mono text-lg text-primary"
        >
          {project.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
          Personal project
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold [overflow-wrap:anywhere]">
        <Link href={projectHref} prefetch={false}>
          {project.name}
        </Link>
      </h3>
      <p className="mt-1 font-mono text-xs text-subtle-foreground [overflow-wrap:anywhere]">
        {project.slug}
      </p>
      <p className="mt-4 text-sm text-muted-foreground [overflow-wrap:anywhere]">
        {project.subdomain
          ? `${project.subdomain}.deployme.in`
          : "No subdomain assigned"}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <Link
          href={projectHref}
          prefetch={false}
          className="text-sm font-medium text-primary"
        >
          Deployment →
        </Link>
        <Link
          href={historyHref}
          prefetch={false}
          aria-current={selected ? "true" : undefined}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          {selected ? "Hide history" : "History"}
        </Link>
      </div>
    </article>
  );
}