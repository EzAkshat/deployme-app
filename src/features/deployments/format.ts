const indiaFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatIndiaTime(value: string): string {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return value;

  return `${indiaFormatter.format(date)} IST`;
}

export function formatProjectLogs(text: string): string {
  // Only rewrite our own line prefixes. Preserve message text and multiline output.
  return text.replace(
    /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\](?= \[(?:system|stdout|stderr)\] )/gm,
    (_, timestamp: string) => `[${formatIndiaTime(timestamp)}]`,
  );
}