"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import type { TeamFormAction } from "../types";

interface InviteFormProps {
  action: TeamFormAction;
  disabled: boolean;
}

export function InviteForm({ action, disabled }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">Invite a member</h2>
      <p className="text-sm text-muted-foreground">
        We’ll email an invitation that expires in seven days.
      </p>

      <form action={action}>
        <input type="hidden" name="operation" value="invite" />

        <fieldset disabled={disabled} className="space-y-4">
          <TextField
            label="Email address"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <SelectField
            label="Role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
          </SelectField>

          <Button type="submit" variant="secondary">
            Send invitation
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}