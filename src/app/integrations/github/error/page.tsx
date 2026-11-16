import { Suspense } from "react";
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "GitHub connection",
  robots: { index: false, follow: false },
};

const MESSAGES = {
  invalid:
    "GitHub authorization was cancelled, expired, or already used. Return to your dashboard and start Connect GitHub again.",
  session:
    "Your DeployMe session is unavailable. Sign in again before connecting GitHub.",
  conflict:
    "GitHub could not be linked because the connection conflicts with an existing link or another update. If you linked this GitHub account to another DeployMe account, sign in to that account.",
  unavailable:
    "We could not confirm that GitHub authorization completed. Return to your dashboard and start a fresh connection attempt if needed.",
} as const;

type Reason = keyof typeof MESSAGES;

type ErrorPageProps = {
  searchParams: Promise<{ reason?: string | string[] }>;
};

function isReason(value: unknown): value is Reason {
  return typeof value === "string" && Object.hasOwn(MESSAGES, value);
}

async function ErrorContent({ searchParams }: ErrorPageProps) {
  const query = await searchParams;
  const reason: Reason = isReason(query.reason) ? query.reason : "unavailable";

  return (
    <section className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8">
      <p className="text-sm font-semibold text-primary">DeployMe · GitHub</p>

      <h1 className="mt-3 text-2xl font-semibold">
        GitHub connection needs attention
      </h1>

      <p className="mt-4 text-sm/6 text-muted-foreground">{MESSAGES[reason]}</p>

      <div className="mt-6">
        <LinkButton href={reason === "session" ? "/login" : "/dashboard"}>
          {reason === "session" ? "Sign in" : "Back to dashboard"}
        </LinkButton>
      </div>
    </section>
  );
}

export default function GitHubErrorPage(props: ErrorPageProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-muted-foreground">
            Loading connection result…
          </p>
        }
      >
        <ErrorContent {...props} />
      </Suspense>
    </main>
  );
}