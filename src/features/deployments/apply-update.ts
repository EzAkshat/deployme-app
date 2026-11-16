import type { ActivityUpdate, ProjectActivityData } from "./types";

/**
 * Applies a stream patch to the previous snapshot. Offsets are JavaScript
 * string lengths, not bytes; a mismatch throws so the caller can resync.
 */
export function applyActivityUpdate(
  previous: ProjectActivityData,
  update: ActivityUpdate,
): ProjectActivityData {
  const prior = new Map(previous.deployments.map((row) => [row.id, row]));

  return {
    ...update,
    deployments: update.deployments.map((patch) => {
      const { logAppend, logOffset, logText, ...metadata } = patch;

      if (typeof logText === "string") return { ...metadata, logText };

      const row = prior.get(patch.id);

      if (
        !row ||
        row.logText.length !== logOffset ||
        typeof logAppend !== "string"
      ) {
        throw new Error(
          "Log offset mismatch; reconnect for a complete snapshot.",
        );
      }

      return { ...metadata, logText: row.logText + logAppend };
    }),
  };
}