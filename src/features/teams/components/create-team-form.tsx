"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { createTeamAction } from "../actions";
import { slugify } from "../slug";
import type { TeamActionState } from "../types";

const INITIAL_STATE: TeamActionState = { message: "" };

export function CreateTeamForm() {
  const [state, action, pending] = useActionState(createTeamAction, INITIAL_STATE);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        <TextField
          label="Team name"
          name="name"
          value={name}
          required
          maxLength={100}
          onChange={(event) => {
            const value = event.target.value;
            setName(value);
            if (!slugEdited) setSlug(slugify(value));
          }}
        />

        <div>
          <TextField
            label="Team slug"
            name="slug"
            value={slug}
            required
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="team-slug-help"
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
          />
          <p id="team-slug-help" className="mt-2 text-sm text-muted-foreground">
            A unique team identifier, such as design-team. This is not a
            website subdomain.
          </p>
        </div>

        <Button type="submit">{pending ? "Creating…" : "Create team"}</Button>
      </fieldset>

      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
    </form>
  );
}