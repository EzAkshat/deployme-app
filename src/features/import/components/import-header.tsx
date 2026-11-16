import Link from "next/link";

interface ImportHeaderProps {
  team: { id: string; name: string } | null;
  githubLogin: string;
}

export function ImportHeader({ team, githubLogin }: ImportHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      <p className="text-sm font-semibold [overflow-wrap:anywhere]">
        Destination: {team ? `Team — ${team.name}` : "Personal workspace"}
      </p>

      {team ? (
        <Link
          href={`/teams/${encodeURIComponent(team.id)}`}
          className="inline-block text-sm underline"
        >
          ← Back to team workspace
        </Link>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Connected as @{githubLogin}
      </p>

      <a
        href="https://github.com/apps/deploymegit/installations/new"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm font-semibold underline"
      >
        Grant or manage repository access ↗
      </a>

      <p className="text-sm text-muted-foreground">
        After changing access on GitHub, return here and refresh this page.
      </p>
    </div>
  );
}