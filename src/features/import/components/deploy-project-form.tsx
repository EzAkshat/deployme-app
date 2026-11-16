"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { deployProjectAction } from "../deploy-action";
import { suggestedSubdomain } from "../subdomain";
import type {
  BuildSettings,
  DeployProjectInput,
  DeployProjectResult,
  GitHubInspection,
  GitHubRepository,
} from "../types";
import { BuildSettingsFields } from "./build-settings-fields";
import { DeploySuccess } from "./deploy-success";

interface DeployProjectFormProps {
  repository: GitHubRepository;
  inspection: GitHubInspection;
  teamId?: string;
}

export function DeployProjectForm({
  repository,
  inspection,
  teamId,
}: DeployProjectFormProps) {
  const router = useRouter();
  const detected = inspection.settings;

  const [settings, setSettings] = useState<BuildSettings>({
    installCommand: detected?.installCommand === "npm ci" ? "npm ci" : "",
    buildCommand: detected?.buildCommand ?? "",
    outputDirectory: detected?.outputDirectory ?? "",
    spaFallback: detected?.spaFallback ?? false,
  });
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DeployProjectResult | null>(null);

  const inFlight = useRef(false);
  const attempt = useRef<{
    key: string;
    fingerprint: string;
    input: DeployProjectInput;
  } | null>(null);

  const needsReview =
    inspection.requiresReview ||
    detected === null ||
    settings.installCommand !== detected.installCommand ||
    settings.buildCommand.trim() !== detected.buildCommand ||
    settings.outputDirectory.trim() !== detected.outputDirectory ||
    settings.spaFallback !== detected.spaFallback;

  const uncertain = result?.ok === false && result.uncertain;
  const locked = busy || uncertain;

  function changeSettings(patch: Partial<BuildSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
    setReviewed(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current) return;

    let request = attempt.current;

    if (!uncertain) {
      const form = new FormData(event.currentTarget);
      const subdomain = String(form.get("subdomain") ?? "").trim();

      const input: DeployProjectInput = {
        ...(teamId
          ? {
              teamId,
              grantCreatorDeploy: form.get("grantCreatorDeploy") === "on",
            }
          : {}),
        name: String(form.get("name") ?? "").trim(),
        slug: subdomain,
        subdomain,
        installationId: inspection.installationId,
        repositoryId: inspection.repositoryId,
        owner: repository.owner,
        repositoryName: repository.name,
        commitSha: inspection.commitSha.toLowerCase(),
        rootDirectory: inspection.rootDirectory,
        installCommand: settings.installCommand,
        buildCommand: settings.buildCommand.trim(),
        outputDirectory: settings.outputDirectory.trim(),
        spaFallback: settings.spaFallback,
        settingsReviewed: needsReview && reviewed,
      };

      if (needsReview && !reviewed) {
        setResult({
          ok: false,
          message: "Review and confirm the build settings first.",
          uncertain: false,
        });
        return;
      }

      const fingerprint = JSON.stringify(input);

      // Reuse the key when retrying the exact same request.
      if (!request || request.fingerprint !== fingerprint) {
        request = { key: crypto.randomUUID(), fingerprint, input };
        attempt.current = request;
      }
    }

    if (!request) return;

    inFlight.current = true;
    setBusy(true);

    try {
      const response = await deployProjectAction(request.input, request.key);
      setResult(response);

      if (response.ok) {
        router.replace(`/projects/${encodeURIComponent(response.project.id)}`);
      }
    } catch {
      setResult({
        ok: false,
        message:
          "The connection was interrupted. Retry the same request to confirm its result.",
        uncertain: true,
      });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  if (result?.ok) {
    return (
      <DeploySuccess project={result.project} deployment={result.deployment} />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 border-t border-border pt-6">
      <h2 className="text-lg font-semibold">Make it yours</h2>

      <fieldset disabled={locked} className="space-y-5 disabled:opacity-60">
        {teamId ? (
          <label className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm">
            <input
              type="checkbox"
              name="grantCreatorDeploy"
              required
              className="mt-1 accent-primary"
            />
            <span>
              Grant me deployment permission on this new team project and start
              its first deployment. Other team members will not receive
              deployment permission automatically.
            </span>
          </label>
        ) : null}

        <TextField
          label="Project name"
          id="project-name"
          name="name"
          defaultValue={repository.name}
          required
          maxLength={100}
        />

        <div>
          <TextField
            label="Subdomain"
            id="subdomain"
            name="subdomain"
            defaultValue={suggestedSubdomain(repository.name)}
            required
            minLength={1}
            maxLength={63}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Use lowercase letters, numbers, and single hyphens between words."
            aria-describedby="subdomain-help"
          />
          <p id="subdomain-help" className="mt-2 text-sm text-muted-foreground">
            Availability is checked when you deploy.
          </p>
        </div>

        <BuildSettingsFields
          settings={settings}
          appFolder={inspection.rootDirectory}
          open={needsReview}
          onChange={changeSettings}
        />

        {needsReview ? (
          <label className="flex items-start gap-3 rounded-xl bg-warning-bg p-4 text-sm text-warning">
            <input
              type="checkbox"
              required
              checked={reviewed}
              onChange={(event) => setReviewed(event.target.checked)}
              className="mt-1 accent-primary"
            />
            I reviewed the inspection messages and confirmed that these
            settings produce the static website files I want to publish.
          </label>
        ) : null}
      </fieldset>

      {result?.ok === false ? (
        <Alert tone="error">
          <p>{result.message}</p>
          {uncertain ? (
            <p className="mt-2">
              Keep this page open and retry below. The retry uses the same
              request, so it can recover an already-created deployment.
            </p>
          ) : null}
        </Alert>
      ) : null}

      <Button type="submit" fullWidth disabled={busy}>
        {busy
          ? "Submitting deployment…"
          : uncertain
            ? "Retry same request"
            : "Deploy project"}
      </Button>
    </form>
  );
}