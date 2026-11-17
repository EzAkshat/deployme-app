import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { isAdministrator } from "@/features/auth/roles";
import { backendRequest } from "@/lib/server/backend";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = {
    title: "Projects | Administration",
    robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

interface ProjectRow {
    id: string;
    name: string;
    slug: string;
    subdomain: string | null;
    archivedAt: string | null;
    ownerUser: {
        id: number;
        username: string;
        suspendedAt: string | null;
    } | null;
    team: {
        id: string;
        name: string;
    } | null;
    latestDeployment: {
        id: string;
        status:
        | "PENDING"
        | "QUEUED"
        | "BUILDING"
        | "READY"
        | "FAILED"
        | "CANCELLED";
        createdAt: string;
        buildStartedAt: string | null;
        buildFinishedAt: string | null;
    } | null;
    lastRecordedPublication: {
        id: string;
        publishedAt: string | null;
    } | null;
}

interface ProjectsPageData {
    projects: ProjectRow[];
    nextCursor: string | null;
}

function formatDate(value: string | null): string {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
    }).format(new Date(value));
}

function buildDuration(
    deployment: ProjectRow["latestDeployment"],
): string {
    if (
        !deployment?.buildStartedAt ||
        !deployment.buildFinishedAt
    ) {
        return "—";
    }

    const duration =
        Date.parse(deployment.buildFinishedAt) -
        Date.parse(deployment.buildStartedAt);

    if (!Number.isFinite(duration) || duration < 0) {
        return "Unavailable";
    }

    return `${Math.round(duration / 1000)} s`;
}

async function ProjectsContent({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const user = await requireUser();

    if (!isAdministrator(user)) notFound();

    const params = await searchParams;

    if (
        (params.search !== undefined && typeof params.search !== "string") ||
        (params.after !== undefined && typeof params.after !== "string")
    ) {
        return <p role="alert">Invalid project search or pagination cursor.</p>;
    }

    const search =
        typeof params.search === "string" ? params.search.trim() : "";
    const after =
        typeof params.after === "string" ? params.after : undefined;

    if (
        search.length > 100 ||
        (after !== undefined && !/^[A-Za-z0-9]{1,128}$/.test(after))
    ) {
        return <p role="alert">Invalid project search or pagination cursor.</p>;
    }

    const query = new URLSearchParams();

    if (search) query.set("search", search);
    if (after) query.set("after", after);

    const response = await backendRequest(
        `/admin/projects${query.size ? `?${query.toString()}` : ""}`,
    );
    

    if (response.status === 401) redirect("/");
    if (response.status === 403) notFound();

    if (!response.ok) {
        return (
            <div className="space-y-3">
                <p role="alert">Unable to load projects. Please try again.</p>
                <Link href="/projects" prefetch={false} className="underline">
                    Reload projects
                </Link>
            </div>
        );
    }

    const data = (await response.json()) as ProjectsPageData;
    const nextQuery = new URLSearchParams();

    if (search) nextQuery.set("search", search);
    if (data.nextCursor) nextQuery.set("after", data.nextCursor);

    return (
        <div className="space-y-6">
            <Link href="/dashboard" prefetch={false} className="text-sm underline">
                Back to administration
            </Link>

            <div>
                <h1 className="text-2xl font-semibold">Projects</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Platform project and deployment records. All times are UTC.
                    Publication history does not confirm current website availability.
                </p>
            </div>

            <form
                action="/projects"
                method="get"
                className="flex flex-wrap items-end gap-3"
            >
                <label className="flex flex-col gap-2 text-sm">
                    Search name, slug, or subdomain
                    <input
                        type="search"
                        name="search"
                        defaultValue={search}
                        maxLength={100}
                        className="rounded-lg border border-border bg-surface px-3 py-2"
                    />
                </label>

                <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                >
                    Search
                </button>

                <Link href="/projects" prefetch={false} className="px-3 py-2 underline">
                    Reset
                </Link>
            </form>

            {data.projects.length === 0 ? (
                <p>No projects found on this page.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface">
                            <tr>
                                <th scope="col" className="p-4">Project</th>
                                <th scope="col" className="p-4">Owner</th>
                                <th scope="col" className="p-4">Latest deployment</th>
                                <th scope="col" className="p-4">Build duration</th>
                                <th scope="col" className="p-4">Last recorded publication</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.projects.map((project) => (
                                <tr key={project.id} className="border-t border-border">
                                    <td className="p-4 align-top">
                                        <div className="font-medium">{project.name}</div>
                                        <div className="text-muted-foreground">
                                            {project.subdomain ?? project.slug}
                                        </div>
                                        <div className="mt-1 text-xs">
                                            {project.archivedAt ? "Archived" : "Active"}
                                        </div>
                                    </td>

                                    <td className="p-4 align-top">
                                        {project.team ? (
                                            <>Team: {project.team.name}</>
                                        ) : project.ownerUser ? (
                                            <>
                                                <div>User: {project.ownerUser.username}</div>
                                                {project.ownerUser.suspendedAt ? (
                                                    <div className="mt-1 text-xs">Account suspended</div>
                                                ) : null}
                                            </>
                                        ) : (
                                            "Ownership unavailable"
                                        )}
                                    </td>

                                    <td className="p-4 align-top">
                                        <div>
                                            {project.latestDeployment?.status ?? "No deployments"}
                                        </div>
                                        {project.latestDeployment ? (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Requested: {formatDate(project.latestDeployment.createdAt)}
                                            </div>
                                        ) : null}
                                    </td>

                                    <td className="p-4 align-top">
                                        {buildDuration(project.latestDeployment)}
                                    </td>

                                    <td className="p-4 align-top">
                                        {project.lastRecordedPublication
                                            ? formatDate(project.lastRecordedPublication.publishedAt)
                                            : "None recorded"}
                                        {project.archivedAt ? (
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Historical record; project is archived.
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <nav aria-label="Project pagination" className="flex items-center gap-4">
                {after ? (
                    <Link
                        href={
                            search
                                ? `/admin/projects?${new URLSearchParams({ search }).toString()}`
                                : "/admin/projects"
                        }
                        prefetch={false}
                        className="underline"
                    >
                        First page
                    </Link>
                ) : null}

                {data.nextCursor ? (
                    <Link
                        href={`/admin/projects?${nextQuery.toString()}`}
                        prefetch={false}
                        className="underline"
                    >
                        Next page
                    </Link>
                ) : null}
            </nav>
        </div>
    );
}

export default function AdminProjectsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    return (
        <PageContainer>
            <Suspense fallback={<p role="status">Loading projects…</p>}>
                <ProjectsContent searchParams={searchParams} />
            </Suspense>
        </PageContainer>
    );
}