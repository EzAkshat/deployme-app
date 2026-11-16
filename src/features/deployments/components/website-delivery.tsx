import type { ActivityDeployment, ProjectDelivery } from "../types";
import { safeWebsiteUrl } from "../website-url";

interface WebsiteDeliveryProps {
  delivery: ProjectDelivery;
  /** The deployment currently shown on the page, if any. */
  inspected: ActivityDeployment | null;
}

export function WebsiteDelivery({ delivery, inspected }: WebsiteDeliveryProps) {
  const website = safeWebsiteUrl(delivery.url);

  return (
    <section
      aria-labelledby="website-address-title"
      className="space-y-2 rounded-xl border border-border bg-surface-secondary p-5"
    >
      <h2 id="website-address-title" className="font-semibold">
        Website address
      </h2>

      {delivery.status === "published" && website ? (
        <>
          <a
            className="break-all underline"
            target="_blank"
            rel="noopener noreferrer"
            href={website}
          >
            {website}
          </a>
          <p className="text-sm text-muted-foreground">
            This address serves the project’s currently published deployment.
            {inspected && delivery.liveDeploymentId !== inspected.id
              ? " The deployment shown above is not the version currently served."
              : null}
          </p>
        </>
      ) : (
        <p>
          {delivery.status === "unknown"
            ? "Unable to verify public delivery right now."
            : "No published website has been confirmed yet."}
        </p>
      )}
    </section>
  );
}