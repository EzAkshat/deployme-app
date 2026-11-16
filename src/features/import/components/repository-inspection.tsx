"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { inspectRepositoryAction } from "../inspect-action";
import type {
  GitHubInspection,
  GitHubRepository,
  InspectionState,
} from "../types";
import { DeployProjectForm } from "./deploy-project-form";

const INITIAL_STATE: InspectionState = { error: "", inspection: null };

const PROJECT_TYPE_LABELS: Record<GitHubInspection["projectType"], string> = {
  static: "Static website",
  "npm-vite": "Vite with npm",
  unknown: "Needs manual configuration",
};

interface RepositoryInspectionProps {
  installationId: number;
  repository: GitHubRepository;
  teamId?: string;
}

export function RepositoryInspection({
  installationId,
  repository,
  teamId,
}: RepositoryInspectionProps) {
  const action = inspectRepositoryAction.bind(null, installationId);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [rootDirectory, setRootDirectory] = useState(".");
  const automaticInspectionStarted = useRef(false);

  // Inspect the repository root as soon as a repository is chosen.
  useEffect(() => {
    if (automaticInspectionStarted.current) return;
    automaticInspectionStarted.current = true;

    const formData = new FormData();
    formData.set("repositoryId", String(repository.repositoryId));
    formData.set("owner", repository.owner);
    formData.set("name", repository.name);
    formData.set("rootDirectory", ".");

    startTransition(() => {
      formAction(formData);
    });
  }, [formAction, repository.repositoryId, repository.owner, repository.name]);

  // Only show a result that matches the folder currently typed.
  const inspection =
    !pending && state.inspection?.rootDirectory === rootDirectory.trim()
      ? state.inspection
      : null;

  return (
    <div className="mt-5 space-y-6">
      <details className="rounded-xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Change app folder or retry detection
        </summary>

        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="repositoryId" value={repository.repositoryId} />
          <input type="hidden" name="owner" value={repository.owner} />
          <input type="hidden" name="name" value={repository.name} />

          <div>
            <TextField
              label="App folder"
              id="rootDirectory"
              name="rootDirectory"
              value={rootDirectory}
              onChange={(event) => setRootDirectory(event.target.value)}
              required
              maxLength={255}
              disabled={pending}
              aria-describedby="folder-help"
            />
            <p id="folder-help" className="mt-2 text-sm text-muted-foreground">
              Use . for the repository root, or a folder such as apps/web.
            </p>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Detecting settings…" : "Detect settings again"}
          </Button>
        </form>
      </details>

      {pending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Reading the repository and detecting build settings…
        </p>
      ) : null}

      {!pending && state.error ? (
        <Alert tone="error">{state.error}</Alert>
      ) : null}

      {inspection ? (
        <section className="space-y-4 rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold">Detected project</h2>

          <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
            Branch: {inspection.defaultBranch} · Commit:{" "}
            {inspection.commitSha.slice(0, 7)}
          </p>

          <p>
            Detected type:{" "}
            <strong>{PROJECT_TYPE_LABELS[inspection.projectType]}</strong>
          </p>

          {inspection.reasons.length > 0 ? (
            <Alert tone="warning">
              <p className="font-semibold">Review before deploying</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {inspection.reasons.map((reason, index) => (
                  <li key={`${index}-${reason}`}>{reason}</li>
                ))}
              </ul>
            </Alert>
          ) : null}

          {inspection.settings === null ? (
            <p className="text-sm text-muted-foreground">
              Automatic settings are unavailable. Review the messages above or
              choose another app folder.
            </p>
          ) : null}

          <DeployProjectForm
            key={`${inspection.commitSha}-${inspection.rootDirectory}`}
            repository={repository}
            inspection={inspection}
            teamId={teamId}
          />
        </section>
      ) : null}
    </div>
  );
}