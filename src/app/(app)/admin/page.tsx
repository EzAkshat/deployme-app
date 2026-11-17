import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { isAdministrator, isSuperAdmin } from "@/features/auth/roles";
import { requireUser } from "@/lib/server/require-user";

export const metadata: Metadata = {
    title: "Administration",
    robots: { index: false, follow: false },
};

const CARD =
    "block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong";

async function AdminHome() {
    const user = await requireUser();

    // Display-only: this page holds links, and the backend decides access
    // on every admin request.
    if (!isAdministrator(user)) notFound();

    return (
        <>
            <PageHeader
                eyebrow="Platform administration"
                title="Administration"
                description="Tools for platform administrators."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/users" prefetch={false} className={CARD}>
                    <h2 className="font-semibold">Users</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Search accounts and view their platform roles.
                    </p>
                </Link>
                <Link href="/admin/health" prefetch={false} className={CARD}>
                    <h2 className="font-semibold">Operational status</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Check database, Redis and worker presence.
                    </p>
                </Link>
                {isSuperAdmin(user) ? (
                    <Link href="/admin/audit" prefetch={false} className={CARD}>
                        <h2 className="font-semibold">Audit history</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review platform-role changes and their reasons.
                        </p>
                    </Link>
                ) : null}
            </div>
        </>
    );
}

export default function AdminPage() {
    return (
        <PageContainer>
            <Suspense
                fallback={
                    <p role="status" className="text-sm text-muted-foreground">
                        Loading administration…
                    </p>
                }
            >
                <AdminHome />
            </Suspense>
        </PageContainer>
    );
}