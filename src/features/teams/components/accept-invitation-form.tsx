"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { acceptTeamInvitationAction } from "../actions";
import type { TeamActionState } from "../types";

const INITIAL_STATE: TeamActionState = { message: "" };

export function AcceptInvitationForm({
  initialToken = "",
}: {
  initialToken?: string;
}) {
  const [state, action, pending] = useActionState(
    acceptTeamInvitationAction,
    INITIAL_STATE,
  );
  const [token, setToken] = useState(initialToken);

  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        <TextField
          label="Invitation token"
          name="token"
          type="password"
          value={token}
          required
          minLength={64}
          maxLength={64}
          pattern="[a-fA-F0-9]{64}"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setToken(event.target.value)}
        />

        <p className="text-sm text-muted-foreground">
          Accepting joins the team with the role assigned by the inviter.
          Opening this page alone does not accept the invitation.
        </p>

        <Button type="submit">{pending ? "Joining…" : "Accept invitation"}</Button>
      </fieldset>

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
    </form>
  );
}