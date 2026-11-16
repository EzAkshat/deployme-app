"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { RefreshButton } from "@/components/ui/refresh-button";
import type { Project } from "../types";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
  projects: Project[];
  selectedId: string | null;
}

export function ProjectList({ projects, selectedId }: ProjectListProps) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const visible = projects.filter((project) =>
    `${project.name} ${project.slug} ${project.subdomain ?? ""}`
      .toLowerCase()
      .includes(query),
  );

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          Projects
          <span className="rounded-md border border-border px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground">
            {projects.length}
          </span>
        </h2>

        <div className="flex flex-wrap gap-3">
          <label>
            <span className="sr-only">Search projects</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects…"
              className="min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-4 text-sm placeholder:text-subtle-foreground focus:border-primary sm:w-64"
            />
          </label>
          <RefreshButton />
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Your next idea starts here."
          description="Connect a repository and publish your first website."
        >
          <LinkButton href="/new" prefetch={false}>
            Import a repository →
          </LinkButton>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState
          title="No matching projects"
          description="Try another name, slug, or subdomain."
        >
          <Button variant="secondary" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              selected={project.id === selectedId}
            />
          ))}
        </div>
      )}
    </section>
  );
}