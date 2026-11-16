import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export function ImportProblem({ message }: { message: string }) {
  return (
    <div className="space-y-3">
      <Alert tone="error">{message}</Alert>
      <Link href="/dashboard" className="inline-block text-sm underline">
        Back to dashboard
      </Link>
    </div>
  );
}