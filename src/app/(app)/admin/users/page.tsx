import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/layout/back-link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DirectoryNotice } from "@/features/admin/components/directory-notice";
import { UserSearchForm } from "@/features/admin/components/user-search-form";
import { UserTable } from "@/features/admin/components/user-table";
import { UsersPagination } from "@/features/admin/components/users-pagination";
import { getAdminUsers } from "@/features/admin/queries";
import { parseUsersQuery } from "@/features/admin/query";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/server/require-user";
import { isSuperAdmin } from "@/features/auth/roles";

export const metadata: Metadata = {
    title: "Users · Administration",
    robots: { index: false, follow: false },
};

type UsersPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function failureMessage(status: number): string {
    if (status === 400) return "The search or pagination cursor was rejected.";
    if (status === 503) {
        return "We could not reach the backend. Please try again shortly.";
    }

    return "We could not load the user directory. Please try again shortly.";
}

async function UserDirectory({ searchParams }: UsersPageProps) {
    const currentUser = await requireUser();

    const query = parseUsersQuery(await searchParams);
    if (!query.ok) return <DirectoryNotice message={query.message} />;

    const { search, after } = query;
    const result = await getAdminUsers(search, after);

    if (!result.ok) {
        // The backend decides access. Non-administrators see a 404.
        if (result.status === 403) notFound();

        return <DirectoryNotice message={failureMessage(result.status)} />;
    }

    const { users, nextCursor } = result.data;

    return (
        <>
            <PageHeader
                eyebrow="Platform administration"
                title="Users"
                description="Search accounts and view their platform roles."
            />

            <UserSearchForm search={search} />

            <p className="mb-4 text-sm text-muted-foreground">
                Showing {users.length} account{users.length === 1 ? "" : "s"} on this
                page.
                {search ? <> Search: “{search}”.</> : null}
            </p>

            {users.length === 0 ? (
                <EmptyState
                    title={after ? "No more matching accounts" : "No accounts found"}
                    description="Try a different search or return to the first page."
                />
            ) : (
                <UserTable
                    users={users}
                    currentUserId={currentUser.id}
                    canManageRoles={isSuperAdmin(currentUser)}
                />
            )}

            <UsersPagination
                search={search}
                isFirstPage={after === undefined}
                nextCursor={nextCursor}
            />
        </>
    );
}

export default function AdminUsersPage(props: UsersPageProps) {
    return (
        <PageContainer>
            <BackLink href="/admin">Platform overview</BackLink>

            <div className="mt-6">
                <Suspense
                    fallback={
                        <p role="status" className="text-sm text-muted-foreground">
                            Loading user directory…
                        </p>
                    }
                >
                    <UserDirectory {...props} />
                </Suspense>
            </div>
        </PageContainer>
    );
}