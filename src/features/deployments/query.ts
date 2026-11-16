export const PROJECT_ID_PATTERN = /^[\w-]{1,128}$/;

const VALUE_PATTERN = /^[\w-]+$/;

const MAX_LENGTH = { before: 512, deployment: 128 } as const;

type QueryKey = keyof typeof MAX_LENGTH;

export type ActivityQuery =
  | { ok: true; query: URLSearchParams }
  | { ok: false };

export function isActivityQueryKey(key: string): boolean {
  return Object.keys(MAX_LENGTH).includes(key);
}

/** `before` and `deployment` are the only parameters, and never together. */
export function parseActivityQuery(
  input: Record<string, string | string[] | undefined>,
): ActivityQuery {
  const query = new URLSearchParams();

  for (const key of Object.keys(MAX_LENGTH) as QueryKey[]) {
    const value = input[key];

    if (value === undefined) continue;

    if (
      typeof value !== "string" ||
      !VALUE_PATTERN.test(value) ||
      value.length > MAX_LENGTH[key]
    ) {
      return { ok: false };
    }

    query.set(key, value);
  }

  if (query.has("before") && query.has("deployment")) return { ok: false };

  return { ok: true, query };
}