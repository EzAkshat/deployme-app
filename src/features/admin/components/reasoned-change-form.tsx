"use client";

import {
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { REASON_MAX_LENGTH, REASON_MIN_LENGTH } from "../reason";

export type ReasonedChangeResult = {
  ok: boolean;
  message: string;
  /** True when the outcome is uncertain or the data is stale. */
  refreshRequired: boolean;
};

interface ReasonedChangeFormProps {
  triggerLabel: string;
  submitLabel: string;
  /** Explains what is about to happen. */
  summary: ReactNode;
  confirmLabel: string;
  /** Styles the buttons for risky actions. */
  danger?: boolean;
  onSubmit: (reason: string) => Promise<ReasonedChangeResult>;
}

export function ReasonedChangeForm({
  triggerLabel,
  submitLabel,
  summary,
  confirmLabel,
  danger = false,
  onSubmit,
}: ReasonedChangeFormProps) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [reloading, startReload] = useTransition();

  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshRequired, setRefreshRequired] = useState(false);

  const locked = busy || reloading || refreshRequired;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current || refreshRequired || !confirmed) return;

    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await onSubmit(reason);

      if (!result.ok) {
        setError(result.message);
        if (result.refreshRequired) setRefreshRequired(true);
        return;
      }

      setNotice(result.message);
      setEditing(false);
      setReason("");
      setConfirmed(false);
    } catch {
      setError("The change could not be confirmed. Refresh before retrying.");
      setRefreshRequired(true);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function cancel() {
    setEditing(false);
    setReason("");
    setConfirmed(false);
    setError("");
  }

  function reload() {
    setError("");
    setRefreshRequired(false);
    startReload(() => router.refresh());
  }

  return (
    <div className="max-w-sm min-w-64 space-y-3">
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {!editing && !refreshRequired ? (
        <Button
          variant={danger ? "danger" : "secondary"}
          onClick={() => {
            setError("");
            setNotice("");
            setEditing(true);
          }}
        >
          {triggerLabel}
        </Button>
      ) : null}

      {editing ? (
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2 text-sm">{summary}</div>

          <TextAreaField
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            minLength={REASON_MIN_LENGTH}
            maxLength={REASON_MAX_LENGTH}
            rows={3}
            disabled={locked}
          />

          <CheckboxField
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            disabled={locked}
            required
            label={confirmLabel}
          />

          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant={danger ? "destructive" : "primary"}
              disabled={
                locked || !confirmed || reason.trim().length < REASON_MIN_LENGTH
              }
            >
              {busy ? "Saving…" : submitLabel}
            </Button>

            <Button variant="secondary" disabled={busy} onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {refreshRequired ? (
        <Button variant="secondary" disabled={busy || reloading} onClick={reload}>
          {reloading ? "Reloading…" : "Reload directory"}
        </Button>
      ) : null}
    </div>
  );
}