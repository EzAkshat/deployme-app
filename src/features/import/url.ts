export type SearchParams = Record<string, string | string[] | undefined>;

export type ImportQuery =
  | {
      ok: true;
      teamId: string | undefined;
      page: number;
      installationId: number | null;
    }
  | { ok: false; message: string };

const TEAM_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

function positiveInteger(value: SearchParams[string]): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;

  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

export function parseImportQuery(query: SearchParams): ImportQuery {
  if (
    query.team !== undefined &&
    (typeof query.team !== "string" || !TEAM_ID_PATTERN.test(query.team))
  ) {
    return { ok: false, message: "Invalid team destination." };
  }

  const page = query.page === undefined ? 1 : positiveInteger(query.page);
  const installationId = positiveInteger(query.installation);

  if (
    page === null ||
    (query.installation !== undefined && installationId === null)
  ) {
    return { ok: false, message: "Invalid page or GitHub installation." };
  }

  return {
    ok: true,
    teamId: typeof query.team === "string" ? query.team : undefined,
    page,
    installationId,
  };
}

/** Every link in the flow is built here, so `team` is never dropped. */
export function importPageUrl({
  page,
  installationId,
  teamId,
}: {
  page: number;
  installationId: number | null;
  teamId?: string;
}): string {
  const query = new URLSearchParams({ page: String(page) });

  if (installationId !== null) query.set("installation", String(installationId));
  if (teamId) query.set("team", teamId);

  return `/new?${query.toString()}`;
}

export function importStartUrl(teamId?: string): string {
  return teamId ? `/new?team=${encodeURIComponent(teamId)}` : "/new";
}