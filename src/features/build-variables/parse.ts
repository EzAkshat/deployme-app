export type PublicVariableRow = {
  name: string;
  value: string;
};

export type ParseResult =
  | { ok: true; variables: Record<string, string> | undefined }
  | { ok: false; message: string };

export const MAX_PUBLIC_VARIABLES = 50;

const NAME_PATTERN =
  /^(?:VITE_|NEXT_PUBLIC_|NUXT_PUBLIC_|REACT_APP_|VUE_APP_|PUBLIC_)[A-Z][A-Z0-9_]*$/;

/** Locale-independent, so the same rows always produce the same request. */
export function compareNames(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isRow(value: unknown): value is PublicVariableRow {
  if (typeof value !== "object" || value === null) return false;

  const row = value as Record<string, unknown>;

  return typeof row.name === "string" && typeof row.value === "string";
}

/**
 * Validates the editor's rows in the browser and in the settings server
 * action. The backend remains the final authority.
 */
export function readPublicBuildVariables(form: FormData): ParseResult {
  const fields = form.getAll("publicBuildVariablesRows");

  // A form without the editor does not submit this field.
  // Preserve its existing variables.
  if (fields.length === 0) {
    return { ok: true, variables: undefined };
  }

  if (fields.length !== 1 || typeof fields[0] !== "string") {
    return { ok: false, message: "Invalid public build variables." };
  }

  const raw = fields[0];

  if (raw.length > 150_000) {
    return { ok: false, message: "Public build variables are too large." };
  }

  let rows: unknown;

  try {
    rows = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Invalid public build variables." };
  }

  if (!Array.isArray(rows) || rows.length > MAX_PUBLIC_VARIABLES) {
    return {
      ok: false,
      message: `Provide at most ${MAX_PUBLIC_VARIABLES} public build variables.`,
    };
  }

  const encoder = new TextEncoder();
  const entries: Array<[string, string]> = [];
  const seen = new Set<string>();
  let totalBytes = 0;

  for (const row of rows) {
    if (!isRow(row)) {
      return { ok: false, message: "Invalid public build variable row." };
    }

    const name = row.name.trim();
    const value = row.value;

    // Ignore a completely unused row. Empty values with a name are valid.
    if (name === "" && value === "") continue;

    if (name.length > 128 || !NAME_PATTERN.test(name)) {
      return {
        ok: false,
        message:
          "Use an uppercase public variable name, such as VITE_API_BASE_URL or PUBLIC_API_BASE_URL.",
      };
    }

    if (seen.has(name)) {
      return { ok: false, message: `Remove the duplicate variable: ${name}.` };
    }

    if (value.includes("\0") || encoder.encode(value).length > 4_096) {
      return {
        ok: false,
        message: `${name} must be at most 4,096 bytes and contain no null characters.`,
      };
    }

    seen.add(name);
    totalBytes += encoder.encode(name).length + encoder.encode(value).length + 2;

    entries.push([name, value]);
  }

  if (totalBytes > 16_384) {
    return {
      ok: false,
      message: "Public build variables must total at most 16,384 bytes.",
    };
  }

  entries.sort(([left], [right]) => compareNames(left, right));

  return { ok: true, variables: Object.fromEntries(entries) };
}