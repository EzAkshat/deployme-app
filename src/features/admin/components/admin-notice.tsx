import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";

interface AdminNoticeProps {
  title: string;
  message: string;
  retryHref?: string;
  retryLabel?: string;
}

export function AdminNotice({
  title,
  message,
  retryHref,
  retryLabel = "Try again",
}: AdminNoticeProps) {
  return (
    <EmptyState title={title} description={message}>
      {retryHref ? (
        <LinkButton href={retryHref} prefetch={false} variant="secondary">
          {retryLabel}
        </LinkButton>
      ) : null}
    </EmptyState>
  );
}