export function safeWebsiteUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "https:" &&
      url.hostname.endsWith(".deployme.in") &&
      !url.username &&
      !url.password &&
      !url.port
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}