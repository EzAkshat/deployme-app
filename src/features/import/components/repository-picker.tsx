"use client";

import { useState } from "react";
import { Tag } from "@/components/ui/tag";
import { TextField } from "@/components/ui/text-field";
import type { GitHubRepository } from "../types";
import { RepositoryInspection } from "./repository-inspection";

interface RepositoryPickerProps {
  installationId: number;
  repositories: GitHubRepository[];
  teamId?: string;
}

export function RepositoryPicker({
  installationId,
  repositories,
  teamId,
}: RepositoryPickerProps) {
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const selected = repositories.find(
    (repository) => String(repository.repositoryId) === selectedId,
  );
  const query = search.trim().toLowerCase();
  const visible = repositories.filter((repository) =>
    repository.fullName.toLowerCase().includes(query),
  );

  return (
    <div className="space-y-6">
      <div>
        <TextField
          label="Find a repository"
          id="repository-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or owner…"
          aria-describedby="repository-search-help"
        />
        <p id="repository-search-help" className="mt-2 text-sm text-muted-foreground">
          Searches repositories on this page. Use the pagination below for
          more.
        </p>
      </div>

      <div
        role="group"
        aria-label="Choose a repository"
        className="max-h-[340px] overflow-auto rounded-lg border border-border"
      >
        {visible.map((repository) => {
          const isSelected = selectedId === String(repository.repositoryId);

          return (
            <button
              type="button"
              key={repository.repositoryId}
              disabled={repository.archived || repository.disabled}
              aria-pressed={isSelected}
              onClick={() => setSelectedId(String(repository.repositoryId))}
              className={`flex w-full cursor-pointer items-center gap-3 border-b border-border p-3.5 text-left last:border-b-0 hover:bg-surface-hover focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "bg-primary-subtle shadow-[inset_3px_0_0_var(--color-primary)]"
                  : "bg-surface"
              }`}
            >
              <span className="min-w-0 flex-1 text-sm font-medium [overflow-wrap:anywhere]">
                {repository.fullName}
                <small className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                  {repository.defaultBranch ?? "No default branch"}
                  {repository.archived ? " · Archived" : ""}
                  {repository.disabled ? " · Unavailable" : ""}
                </small>
              </span>
              <Tag>{repository.private ? "Private" : "Public"}</Tag>
              <span aria-hidden="true">{isSelected ? "✓" : "→"}</span>
            </button>
          );
        })}

        {visible.length === 0 ? (
          <p role="status" className="p-4 text-sm text-muted-foreground">
            No repositories match this search on this page.
          </p>
        ) : null}
      </div>

      {selected ? (
        <div className="border-t border-border pt-6">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Configuring
          </p>
          <h2 className="mt-1 text-lg font-semibold [overflow-wrap:anywhere]">
            {selected.fullName}
          </h2>
          <RepositoryInspection
            key={`${teamId ?? "personal"}-${selected.repositoryId}`}
            installationId={installationId}
            repository={selected}
            teamId={teamId}
          />
        </div>
      ) : null}
    </div>
  );
}