import type { ReactNode } from "react";

type Tone = "warning" | "danger";

const BOX: Record<Tone, string> = {
  warning: "border-warning/40 bg-warning-bg text-warning",
  danger: "border-destructive/40 bg-destructive-bg text-destructive",
};

interface NoticeCardProps {
  tone: Tone;
  title: string;
  children: ReactNode;
}

export function NoticeCard({ tone, title, children }: NoticeCardProps) {
  return (
    <section className={`space-y-4 rounded-xl border p-5 ${BOX[tone]}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm">{children}</div>
    </section>
  );
}