import type { ReactNode } from "react";

type Tone = "error" | "info";

const TONES: Record<Tone, string> = {
  error: "bg-destructive-bg text-destructive",
  info: "bg-info-bg text-info",
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg p-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </p>
  );
}