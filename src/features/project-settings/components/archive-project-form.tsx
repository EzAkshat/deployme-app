"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import type { SettingsState } from "../types";

interface ArchiveProjectFormProps {
  slug: string;
  action: (payload: FormData) => void;
  state: SettingsState;
  archiving: boolean;
  disabled: boolean;
}

export function ArchiveProjectForm({
  slug,
  action,
  state,
  archiving,
  disabled,
}: ArchiveProjectFormProps) {
  const [confirmation, setConfirmation] = useState("");

  return (
    <form
      action={action}
      className="space-y-4 rounded-xl border border-destructive/40 bg-destructive-bg p-5"
    >
      <div>
        <h2 className="text-xl font-semibold text-destructive">
          Archive project
        </h2>
        <p className="mt-2 text-sm text-destructive">
          Archiving removes this project from active projects and requests
          that its public website be taken offline. Public delivery may remain
          available briefly while shutdown is processed.
        </p>
      </div>

      <fieldset disabled={disabled} className="space-y-3">
        <TextField
          danger
          label={
            <>
              Type <strong className="font-mono">{slug}</strong> to confirm.
            </>
          }
          id="archive-confirmation"
          name="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          autoComplete="off"
          spellCheck={false}
          maxLength={100}
          className="font-mono"
        />

        <Button
          type="submit"
          variant="destructive"
          disabled={disabled || confirmation !== slug}
        >
          {archiving ? "Archiving…" : "Archive project"}
        </Button>
      </fieldset>

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
    </form>
  );
}