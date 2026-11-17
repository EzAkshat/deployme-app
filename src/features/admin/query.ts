type SearchParams = Record<string, string | string[] | undefined>;

export type UsersQuery =
  | { ok: true; search: string; after: string | undefined }
  | { ok: false; message: string };

const CURSOR_PATTERN = /^[1-9]\d{0,9}$/;
const MAX_CURSOR = 2_147_483_647;
const MAX_SEARCH_LENGTH = 100;

export function parseUsersQuery(params: SearchParams): UsersQuery {
  if (Array.isArray(params.search) || Array.isArray(params.after)) {
    return {
      ok: false,
      message: "Provide only one search and pagination cursor.",
    };
  }

  const search = params.search?.trim() ?? "";
  const after = params.after;

  if (
    search.length > MAX_SEARCH_LENGTH ||
    (after !== undefined &&
      (!CURSOR_PATTERN.test(after) || Number(after) > MAX_CURSOR))
  ) {
    return {
      ok: false,
      message: "The search or pagination cursor is invalid.",
    };
  }

  return { ok: true, search, after };
}

/** Pagination links keep the search; searching again resets the cursor. */
export function usersUrl(search: string, after?: string): string {
  const query = new URLSearchParams();

  if (search) query.set("search", search);
  if (after) query.set("after", after);

  const suffix = query.toString();

  return `/admin/users${suffix ? `?${suffix}` : ""}`;
}