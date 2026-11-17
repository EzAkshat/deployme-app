"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import {
  completeOnboardingAction,
  logoutAction,
  requestOtpAction,
  verifyOtpAction,
} from "@/features/auth/actions";
import { homePathFor } from "@/features/auth/paths";
import type { ActionResult } from "@/lib/result";
import { AuthCard } from "./auth-card";
import { EmailForm } from "./email-form";
import { OnboardingForm } from "./onboarding-form";
import { OtpForm } from "./otp-form";

type Screen = "email" | "otp" | "onboarding";
type Destination = "/login" | "/onboarding" | "/dashboard";

interface AuthFlowProps {
  initialScreen: "email" | "onboarding";
  initialEmail?: string;
  admin?: boolean;
}

const TITLES: Record<Screen, string> = {
  email: "Welcome to DeployMe",
  otp: "Check your inbox",
  onboarding: "What should we call you?",
};

function errorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Cannot reach DeployMe. Check your connection and try again.";
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function AuthFlow({ initialScreen, initialEmail = "", admin = false, }: AuthFlowProps) {

  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [email, setEmail] = useState(initialEmail);
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [codeAttempt, setCodeAttempt] = useState(0);
  const [name, setName] = useState("");
  const [requestPending, setRequestPending] = useState(false);
  const [navigationPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submitting = useRef(false);
  const busy = requestPending || navigationPending;

  function navigate(destination: Destination) {
    startTransition(() => {
      router.replace(destination);
      router.refresh();
    });
  }

  function clearCode() {
    setCode("");
    setCodeAttempt((attempt) => attempt + 1);
  }

  function sessionLost() {
    clearCode();
    setChallengeId("");
    setScreen("email");
    setError("Your session is unavailable. Please sign in again.");

    if (initialScreen === "onboarding") navigate("/login");
  }

  /**
   * Runs one request at a time.
   * onFailure receives the HTTP status (null if the call itself threw)
   * and returns true to suppress the default error message.
   */
  async function run<T>(
    action: () => Promise<ActionResult<T>>,
    onSuccess: (data: T) => void,
    onFailure?: (status: number | null) => boolean,
  ) {
    if (submitting.current || navigationPending) return;

    submitting.current = true;
    setRequestPending(true);
    setError("");
    setNotice("");

    try {
      const result = await action();

      if (result.ok) {
        onSuccess(result.data);
      } else if (result.status === 401) {
        sessionLost();
      } else if (!onFailure?.(result.status)) {
        setError(result.message);
      }
    } catch (failure) {
      if (!onFailure?.(null)) setError(errorMessage(failure));
    } finally {
      submitting.current = false;
      setRequestPending(false);
    }
  }

  function sendCode() {
    const normalizedEmail = email.trim();

    void run(
      async () => {
        // A new request can invalidate the previous challenge.
        setChallengeId("");
        clearCode();
        return requestOtpAction(normalizedEmail);
      },
      (data) => {
        setEmail(normalizedEmail);
        setChallengeId(data.challengeId);
        setNotice(data.message);
        setScreen("otp");
      },
    );
  }

  function verifyCode(value: string) {
    if (!challengeId || !/^\d{6}$/.test(value)) return;

    void run(
      () => verifyOtpAction(email, challengeId, value),
      ({ user }) => {
        setCode("");
        setChallengeId("");
        navigate(admin ? "/dashboard" : homePathFor(user));
      },
      () => {
        // Let the person retype from the first box.
        clearCode();
        return false;
      },
    );
  }

  function submitName() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    void run(
      () => completeOnboardingAction(trimmedName),
      ({ user }) => navigate(homePathFor(user)),
      (status) => {
        if (status === 409) {
          // Another tab may have completed onboarding.
          // The dashboard checks the current session on the server.
          navigate("/dashboard");
          return true;
        }

        return false;
      },
    );
  }

  function signOut() {
    void run(
      () => logoutAction(),
      () => {
        clearCode();
        setChallengeId("");
        navigate("/login");
      },
    );
  }

  function changeEmail() {
    clearCode();
    setChallengeId("");
    setError("");
    setNotice("");
    setScreen("email");
  }

  return (
    <AuthCard
      title={
        admin && screen === "email"
          ? "Administrator sign in"
          : TITLES[screen]
      }
      busy={busy}
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="info">{notice}</Alert> : null}

      {navigationPending ? (
        <p role="status" className="text-sm text-muted-foreground">
          Opening your next page…
        </p>
      ) : null}

      {screen === "email" ? (
        <EmailForm
          email={email}
          busy={busy}
          onEmailChange={setEmail}
          onSubmit={sendCode}
        />
      ) : null}

      {screen === "otp" ? (
        <OtpForm
          email={email}
          code={code}
          attempt={codeAttempt}
          busy={busy}
          ready={Boolean(challengeId)}
          onCodeChange={setCode}
          onVerify={verifyCode}
          onResend={sendCode}
          onChangeEmail={changeEmail}
        />
      ) : null}

      {screen === "onboarding" ? (
        <OnboardingForm
          name={name}
          busy={busy}
          onNameChange={setName}
          onSubmit={submitName}
          onSignOut={signOut}
        />
      ) : null}
    </AuthCard>
  );
}