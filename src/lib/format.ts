export function formatMilliseconds(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return "Unavailable";
  }

  if (value === 0) return "0 ms";
  if (value < 1000) return `${value.toFixed(1)} ms`;

  return `${(value / 1000).toFixed(2)} s`;
}

export function formatBytes(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return "Unavailable";
  }

  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KiB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MiB`;

  return `${(value / 1024 ** 3).toFixed(2)} GiB`;
}

export function formatUtcDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : date.toISOString().slice(0, 10);
}

export function formatUtcDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unavailable";

  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}