import Link from "next/link";
import type { Team } from "../types";

export function TeamCard({ team }: { team: Team }) {
  return (
    <article className="space-y-3 rounded-xl border border-border bg-surface p-5">
      <h2 className="text-lg font-semibold [overflow-wrap:anywhere]">
        {team.name}
      </h2>
      <p className="text-sm break-all text-muted-foreground">{team.slug}</p>
      <p className="text-sm">
        Your role: <strong>{team.role}</strong>
      </p>
      <Link
        href={`/teams/${encodeURIComponent(team.id)}`}
        prefetch={false}
        className="inline-block text-sm font-medium text-primary"
      >
        Open workspace →
      </Link>
    </article>
  );
}