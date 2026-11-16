"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { archiveProjectAction, saveProjectSettings } from "../actions";
import type { BuildSettingsValues, SettingsState } from "../types";
import { ArchiveProjectForm } from "./archive-project-form";
import { BuildSettingsForm } from "./build-settings-form";

const INITIAL_STATE: SettingsState = { ok: false, message: "" };

interface SettingsPanelProps {
  projectId: string;
  slug: string;
  initial: BuildSettingsValues;
}

export function SettingsPanel({ projectId, slug, initial }: SettingsPanelProps) {
  const [saveState, saveAction, saving] = useActionState(
    saveProjectSettings.bind(null, projectId),
    INITIAL_STATE,
  );

  const [archiveState, archiveAction, archiving] = useActionState(
    archiveProjectAction.bind(null, projectId),
    INITIAL_STATE,
  );

  const archived = archiveState.archived === true;
  const disabled = saving || archiving || archived;

  if (archived) {
    return (
      <Card className="space-y-4">
        <p role="status">{archiveState.message}</p>
        <LinkButton href="/dashboard">Back to dashboard</LinkButton>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <BuildSettingsForm
        initial={initial}
        action={saveAction}
        state={saveState}
        saving={saving}
        disabled={disabled}
      />

      <ArchiveProjectForm
        slug={slug}
        action={archiveAction}
        state={archiveState}
        archiving={archiving}
        disabled={disabled}
      />
    </div>
  );
}