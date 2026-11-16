import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import { getInstallations } from "../queries";
import { importPageUrl } from "../url";
import { ImportProblem } from "./import-problem";

interface InstallationStepProps {
  page: number;
  teamId?: string;
}

export async function InstallationStep({ page, teamId }: InstallationStepProps) {
  const result = await getInstallations(page);

  if (!result.ok) return <ImportProblem message={result.message} />;

  const { installations, nextPage } = result.data;

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">Choose a GitHub account</h2>

      {installations.length === 0 ? (
        <p className="text-muted-foreground">
          No installations were found on this page. Grant DeployMe access to
          your repositories using the link above.
        </p>
      ) : null}

      <div className="grid gap-3">
        {installations.map((installation) => (
          <div
            key={installation.installationId}
            className="rounded-xl border border-border p-4"
          >
            <p className="font-semibold [overflow-wrap:anywhere]">
              {installation.accountLogin ?? "GitHub account"}
            </p>

            {installation.suspended ? (
              <p className="mt-2 text-sm text-warning">
                This installation is suspended.
              </p>
            ) : (
              <Link
                prefetch={false}
                href={importPageUrl({
                  page: 1,
                  installationId: installation.installationId,
                  teamId,
                })}
                className="mt-2 inline-block text-sm underline"
              >
                Choose repository →
              </Link>
            )}
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        previousHref={
          page > 1
            ? importPageUrl({ page: page - 1, installationId: null, teamId })
            : null
        }
        nextHref={
          nextPage !== null
            ? importPageUrl({ page: nextPage, installationId: null, teamId })
            : null
        }
      />
    </>
  );
}