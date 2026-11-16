import { Card } from "@/components/ui/card";
import type { ProjectSettings } from "../types";

export function RepositoryCard({
  repository,
}: {
  repository: ProjectSettings["gitRepository"];
}) {
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">GitHub repository</h2>

      {repository ? (
        <>
          <a
            href={`https://github.com/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block break-all underline"
          >
            {repository.owner}/{repository.name}
          </a>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Production branch</dt>
              <dd className="mt-1 font-mono break-all">
                {repository.productionBranch}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                Repository default branch
              </dt>
              <dd className="mt-1 font-mono break-all">
                {repository.defaultBranch}
              </dd>
            </div>
          </dl>

          <p className="text-sm text-muted-foreground">
            Repository and branch configuration are read-only here.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No GitHub repository is connected.
        </p>
      )}
    </Card>
  );
}