import { PageContainer } from "@/components/layout/page-container";

export default function Loading() {
  return (
    <PageContainer>
      <p role="status" className="text-sm text-muted-foreground">
        Loading…
      </p>
    </PageContainer>
  );
}