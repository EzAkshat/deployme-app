import Link from "next/link";

interface DeploySuccessProps {
  project: { id: string; name: string };
  deployment: { id: string; status: string };
}

export function DeploySuccess({ project, deployment }: DeploySuccessProps) {
  return (
    <section
      role="status"
      className="space-y-3 rounded-xl border border-success bg-success-bg p-5 text-success"
    >
      <h2 className="text-lg font-semibold">Deployment requested</h2>

      <p className="[overflow-wrap:anywhere]">
        {project.name} — {deployment.status}
      </p>

      <p className="text-sm">
        The build will run in the background. Check deployment history on your
        dashboard for its progress.
      </p>

      <Link
        href={`/projects/${encodeURIComponent(project.id)}?deployment=${encodeURIComponent(deployment.id)}`}
        prefetch={false}
        className="inline-block font-semibold underline"
      >
        View deployment progress →
      </Link>
    </section>
  );
}