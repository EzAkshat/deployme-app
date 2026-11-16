import { RefreshButton } from "@/components/ui/refresh-button";
import type { ProjectAccessData } from "../types";
import { MemberAccessCard } from "./member-access-card";

export function ProjectAccess({ data }: { data: ProjectAccessData }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Only team owners and managers can change sharing permissions. A
        member’s Manage grant does not allow them to change sharing. For
        members who need to use the project dashboard, also grant View.
      </p>

      <RefreshButton label="Refresh access" />

      {data.members.map((member) => (
        <MemberAccessCard
          key={member.user.id}
          projectId={data.project.id}
          member={member}
        />
      ))}
    </div>
  );
}