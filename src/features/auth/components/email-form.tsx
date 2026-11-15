import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

interface EmailFormProps {
  email: string;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function EmailForm({
  email,
  busy,
  onEmailChange,
  onSubmit,
}: EmailFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Sign in or create an account with your email.
      </p>

      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={254}
        required
        value={email}
        disabled={busy}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="you@example.com"
      />

      <Button type="submit" fullWidth disabled={busy}>
        {busy ? "Please wait…" : "Continue with email"}
      </Button>
    </form>
  );
}