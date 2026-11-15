import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";

interface OtpFormProps {
  email: string;
  code: string;
  /** Changing this remounts the boxes, which clears and refocuses them. */
  attempt: number;
  busy: boolean;
  ready: boolean;
  onCodeChange: (value: string) => void;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

export function OtpForm({
  email,
  code,
  attempt,
  busy,
  ready,
  onCodeChange,
  onVerify,
  onResend,
  onChangeEmail,
}: OtpFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onVerify(code);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-muted-foreground">
        Enter the six-digit code sent to{" "}
        <span className="font-medium break-all text-foreground">{email}</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <OtpInput
          key={attempt}
          autoFocus
          value={code}
          onChange={onCodeChange}
          onComplete={onVerify}
          disabled={busy || !ready}
        />

        <Button
          type="submit"
          fullWidth
          disabled={busy || !ready || code.length !== 6}
        >
          {busy ? "Please wait…" : "Verify and continue"}
        </Button>
      </form>

      <div className="flex justify-between gap-4">
        <Button variant="ghost" disabled={busy} onClick={onResend}>
          Resend code
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onChangeEmail}>
          Change email
        </Button>
      </div>
    </div>
  );
}