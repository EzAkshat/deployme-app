import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        This page doesn’t exist, or you don’t have access to it.
      </p>
      <div className="mt-6">
        <LinkButton href="/dashboard">Go to dashboard</LinkButton>
      </div>
    </main>
  );
}