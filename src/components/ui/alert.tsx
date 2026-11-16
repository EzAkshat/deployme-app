import type { ReactNode } from "react";

type Tone = "error" | "info" | "warning" | "success";

const TONES: Record<Tone, string> = {
  error: "bg-destructive-bg text-destructive",
  info: "bg-info-bg text-info",
  warning: "bg-warning-bg text-warning",
  success: "bg-success-bg text-success",
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg p-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}