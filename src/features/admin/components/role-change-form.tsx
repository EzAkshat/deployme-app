"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { changeUserRoleAction } from "../change-role-action";
import {
  ROLE_REASON_MAX,
  ROLE_REASON_MIN,
  roleChangeLabel,
  toggledRole,
  type ChangeableRole,
} from "../role-change";

interface RoleChangeFormProps {
  userId: number;
  username: string;
  currentRole: ChangeableRole;
}

export function RoleChangeForm({
  userId,
  username,
  currentRole,
}: RoleChangeFormProps) {
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

  const nextRole = toggledRole(currentRole);
  const locked = busy || reloading || refreshRequired;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current || refreshRequired || !confirmed) return;

    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await changeUserRoleAction({
        userId,
        expectedRole: currentRole,
        nextRole,
        reason,
      });

      if (!result.ok) {
        setError(result.message);

        // Require fresh data after conflicts, authorization failures,
        // or uncertain outcomes.
        if (result.status !== 400 && result.status !== 429) {
          setRefreshRequired(true);
        }

        return;
      }

      setNotice(
        result.changed
          ? "Role updated. Existing sessions were revoked."
          : "The account already has this role.",
      );
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
          variant="secondary"
          onClick={() => {
            setError("");
            setNotice("");
            setEditing(true);
          }}
        >
          Change role
        </Button>
      ) : null}

      {editing ? (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm">
            Change <strong>@{username}</strong> to{" "}
            <strong>{roleChangeLabel(nextRole)}</strong>.
          </p>

          <TextAreaField
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            minLength={ROLE_REASON_MIN}
            maxLength={ROLE_REASON_MAX}
            rows={3}
            disabled={locked}
          />

          <CheckboxField
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            disabled={locked}
            required
            label="I understand this changes platform permissions and signs this account out of its existing sessions."
          />

          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={
                locked || !confirmed || reason.trim().length < ROLE_REASON_MIN
              }
            >
              {busy ? "Saving…" : "Confirm role change"}
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