import { Suspense } from "react";
import { redirect } from "next/navigation";
import { homePathFor } from "@/features/auth/paths";
import { getCurrentUser } from "@/lib/server/session";

async function EntryRedirect(): Promise<never> {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/login");
  }

  return redirect(homePathFor(user));
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <EntryRedirect />
    </Suspense>
  );
}