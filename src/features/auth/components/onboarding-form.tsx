import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

interface OnboardingFormProps {
  name: string;
  busy: boolean;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  onSignOut: () => void;
}

export function OnboardingForm({
  name,
  busy,
  onNameChange,
  onSubmit,
  onSignOut,
}: OnboardingFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Add your name to finish setting up your account.
      </p>

      <TextField
        label="Your name"
        name="name"
        type="text"
        autoComplete="name"
        maxLength={100}
        required
        value={name}
        disabled={busy}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Your name"
      />

      <Button type="submit" fullWidth disabled={busy || !name.trim()}>
        {busy ? "Please wait…" : "Finish setup"}
      </Button>

      <Button variant="ghost" fullWidth disabled={busy} onClick={onSignOut}>
        Sign out
      </Button>
    </form>
  );
}