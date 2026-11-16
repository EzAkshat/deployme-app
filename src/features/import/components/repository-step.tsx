import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { getRepositories } from "../queries";
import { importPageUrl, importStartUrl } from "../url";
import { ImportProblem } from "./import-problem";
import { RepositoryPicker } from "./repository-picker";

interface RepositoryStepProps {
  installationId: number;
  page: number;
  teamId?: string;
}

export async function RepositoryStep({
  installationId,
  page,
  teamId,
}: RepositoryStepProps) {
  const result = await getRepositories(installationId, page);

  if (!result.ok) return <ImportProblem message={result.message} />;

  const { repositories, nextPage } = result.data;

  return (
    <>
      <Link
        href={importStartUrl(teamId)}
        prefetch={false}
        className="mb-6 inline-block text-sm underline"
      >
        ← Choose another GitHub account
      </Link>

      {repositories.length === 0 ? (
        <p className="text-muted-foreground">
          No repositories were found on this page. Check the repositories
          granted to DeployMe on GitHub.
        </p>
      ) : (
        <RepositoryPicker
          key={`${teamId ?? "personal"}-${installationId}-${page}`}
          installationId={installationId}
          repositories={repositories}
          teamId={teamId}
        />
      )}

      <Pagination
        page={page}
        previousHref={
          page > 1
            ? importPageUrl({ page: page - 1, installationId, teamId })
            : null
        }
        nextHref={
          nextPage !== null
            ? importPageUrl({ page: nextPage, installationId, teamId })
            : null
        }
      />
    </>
  );
}