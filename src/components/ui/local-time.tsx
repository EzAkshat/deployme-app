"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function parse(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLocal(value: string): string {
  return parse(value)?.toLocaleString() ?? "Unavailable";
}

function formatUtc(value: string): string {
  const date = parse(value);
  if (!date) return "Unavailable";

  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/**
 * Server render and hydration show UTC; the browser then switches to
 * the viewer's own time zone without a hydration mismatch.
 */
export function LocalTime({ value }: { value: string }) {
  const text = useSyncExternalStore(
    noopSubscribe,
    () => formatLocal(value),
    () => formatUtc(value),
  );

  return <time dateTime={value}>{text}</time>;
}