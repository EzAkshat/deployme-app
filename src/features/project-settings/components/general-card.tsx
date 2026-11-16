import { Card } from "@/components/ui/card";
import type { ProjectSettings } from "../types";

export function GeneralCard({ project }: { project: ProjectSettings }) {
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold">General</h2>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Project name</dt>
          <dd className="mt-1 [overflow-wrap:anywhere]">{project.name}</dd>
        </div>

        <div>
          <dt className="text-muted-foreground">Project slug</dt>
          <dd className="mt-1 font-mono break-all">{project.slug}</dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Assigned website address</dt>
          <dd className="mt-1 break-all">
            {project.subdomain
              ? `${project.subdomain}.deployme.in`
              : "No address assigned"}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">
        Project name, slug and website address are read-only here. An assigned
        address does not necessarily mean the website is currently published.
      </p>
    </Card>
  );
}