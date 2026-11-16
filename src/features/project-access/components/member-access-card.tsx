"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { updateProjectAccess } from "../actions";
import type { ProjectAccessMember, ProjectAccessState } from "../types";

const INITIAL_STATE: ProjectAccessState = { ok: false, message: "" };

const mark = (value: boolean) => (value ? "✓" : "—");

interface MemberAccessCardProps {
  projectId: string;
  member: ProjectAccessMember;
}

export function MemberAccessCard({ projectId, member }: MemberAccessCardProps) {
  const [state, action, pending] = useActionState(
    updateProjectAccess.bind(null, projectId),
    INITIAL_STATE,
  );

  const roleAccess = member.role === "OWNER" || member.role === "MANAGER";

  const effectiveView = roleAccess || member.share?.canView === true;
  const effectiveDeploy = member.share?.canDeploy === true;
  const effectiveManage = roleAccess || member.share?.canManage === true;

  // Remount checkbox defaults when the server returns changed grants.
  const formKey = [
    member.role,
    member.share === null ? "none" : "share",
    member.share?.canView,
    member.share?.canDeploy,
    member.share?.canManage,
  ].join(":");

  return (
    <article
      aria-busy={pending}
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
    >
      <div>
        <h2 className="font-semibold [overflow-wrap:anywhere]">
          {member.user.name}
        </h2>
        <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
          @{member.user.username} · {member.role}
        </p>
      </div>

      <p className="text-sm">
        Current access: View {mark(effectiveView)} · Deploy{" "}
        {mark(effectiveDeploy)} · Manage {mark(effectiveManage)}
      </p>

      {roleAccess ? (
        <p className="text-sm text-muted-foreground">
          This team role always allows viewing and management. Deployment
          requires an explicit grant.
        </p>
      ) : null}

      <form key={formKey} action={action}>
        <input type="hidden" name="operation" value="save" />
        <input type="hidden" name="userId" value={member.user.id} />

        <fieldset disabled={pending} className="space-y-3">
          <legend className="mb-3 text-sm font-medium">Explicit grants</legend>

          <div className="flex flex-wrap gap-5">
            <CheckboxField
              name="canView"
              label="View"
              defaultChecked={member.share?.canView ?? false}
            />
            <CheckboxField
              name="canDeploy"
              label="Deploy"
              defaultChecked={member.share?.canDeploy ?? false}
            />
            <CheckboxField
              name="canManage"
              label="Manage"
              defaultChecked={member.share?.canManage ?? false}
            />
          </div>

          <Button type="submit" variant="secondary">
            {pending ? "Updating…" : "Save permissions"}
          </Button>
        </fieldset>
      </form>

      {member.share ? (
        <form
          action={action}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Remove all explicit grants for ${member.user.name}? ` +
                  "Owners and managers retain role-based viewing and management access.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="operation" value="revoke" />
          <input type="hidden" name="userId" value={member.user.id} />

          <Button type="submit" variant="danger" disabled={pending}>
            Remove explicit grants
          </Button>
        </form>
      ) : null}

      {state.message ? (
        <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
      ) : null}
    </article>
  );
}