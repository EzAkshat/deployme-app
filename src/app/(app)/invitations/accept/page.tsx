import { Suspense } from "react";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { AcceptInvitationForm } from "@/features/teams/components/accept-invitation-form";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Accept team invitation",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type AcceptPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

async function InvitationContent({ searchParams }: AcceptPageProps) {
  const { token } = await searchParams;
  const user = await getCurrentUser();

  if (!user || user.onboardingCompletedAt === null) {
    return (
      <div className="space-y-4">
        <p>
          Sign in using the email address that received the invitation and
          complete onboarding.
        </p>

        <a
          href={user ? "/onboarding" : "/login"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block underline"
        >
          {user ? "Complete onboarding" : "Sign in"} in a new tab →
        </a>

        <p className="text-sm text-muted-foreground">
          Afterward, return to this tab and reload it, or reopen the
          invitation email link.
        </p>
      </div>
    );
  }

  if (
    token !== undefined &&
    (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token))
  ) {
    return (
      <Alert tone="error">
        This invitation link is malformed. Open the complete link from your
        email.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Signed in as {user.email}. This must match the invited email address.
      </p>

      <AcceptInvitationForm initialToken={token ?? ""} />
    </div>
  );
}

export default function AcceptInvitationPage(props: AcceptPageProps) {
  return (
    <PageContainer size="form">
      <BackLink href="/teams">Your teams</BackLink>

      <Card className="mt-6 space-y-5">
        <h1 className="text-2xl font-semibold">Accept team invitation</h1>

        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              Loading invitation…
            </p>
          }
        >
          <InvitationContent {...props} />
        </Suspense>
      </Card>
    </PageContainer>
  );
}