import { Button } from "@/components/ui/button";
import { confirmBeforeSubmit } from "@/lib/confirm-submit";
import type { InvitationView, TeamFormAction } from "../types";

interface InvitationListProps {
  invitations: InvitationView[];
  action: TeamFormAction;
  disabled: boolean;
}

export function InvitationList({
  invitations,
  action,
  disabled,
}: InvitationListProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Invitations</h2>

      {invitations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No invitations have been sent.
        </p>
      ) : null}

      {invitations.map((invitation) => (
        <article
          key={invitation.id}
          className="space-y-2 rounded-xl border border-border bg-surface p-4"
        >
          <h3 className="font-medium break-all">{invitation.email}</h3>
          <p className="text-sm">
            {invitation.role} · {invitation.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Expires: {invitation.expiresLabel}
          </p>

          {invitation.canRevoke ? (
            <form
              action={action}
              onSubmit={confirmBeforeSubmit(
                `Revoke the invitation for ${invitation.email}?`,
              )}
            >
              <input type="hidden" name="operation" value="revoke" />
              <input type="hidden" name="invitationId" value={invitation.id} />

              <Button type="submit" variant="secondary" disabled={disabled}>
                Revoke invitation
              </Button>
            </form>
          ) : null}
        </article>
      ))}
    </section>
  );
}