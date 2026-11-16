import type { InvitationView, TeamInvitation } from "./types";

const indiaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** `serverTime` is the backend's response time (ms), not this server's clock. */
export function buildInvitationViews(
  invitations: TeamInvitation[],
  serverTime: number,
): InvitationView[] {
  return invitations.map((invitation) => {
    const expires = Date.parse(invitation.expiresAt);
    const expired = Number.isFinite(serverTime) && expires <= serverTime;

    return {
      ...invitation,
      status:
        invitation.status === "PENDING" && expired
          ? "EXPIRED"
          : invitation.status,
      canRevoke:
        invitation.status === "PENDING" &&
        Number.isFinite(expires) &&
        !expired,
      expiresLabel: Number.isFinite(expires)
        ? `${indiaTime.format(new Date(expires))} IST`
        : "Unavailable",
    };
  });
}