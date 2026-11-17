"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { respondToTeamInvitationAction } from "../actions";
import type { TeamActionState } from "../types";

const INITIAL_STATE: TeamActionState = { message: "" };

export function AcceptInvitationForm({
  initialToken = "",
}: {
  initialToken?: string;
}) {
  const [state, action, pending] = useActionState(
    respondToTeamInvitationAction,
    INITIAL_STATE,
  );
  const [token, setToken] = useState(initialToken);

  if (state.declined) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{state.message}</Alert>
        <Link href="/teams" prefetch={false} className="underline">
          Go to your teams
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-4">
        <TextField
          label="Invitation code"
          name="token"
          type="text"
          value={token}
          required
          minLength={8}
          maxLength={64}
          pattern="([A-Za-z0-9_\-]{8}|[a-fA-F0-9]{64})"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => setToken(event.target.value)}
        />

        <p className="text-sm text-muted-foreground">
          Accepting joins the team with the assigned role. Declining closes
          this invitation without joining. Opening this page does neither.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" name="operation" value="accept">
            Accept invitation
          </Button>

          <Button
            type="submit"
            name="operation"
            value="decline"
            variant="secondary"
          >
            Decline invitation
          </Button>
        </div>
      </fieldset>

      {pending ? <p role="status">Submitting your response…</p> : null}

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
    </form>
  );
}