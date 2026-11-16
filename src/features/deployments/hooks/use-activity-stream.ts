import { useEffect, useRef, useState } from "react";
import { applyActivityUpdate } from "../apply-update";
import type { ActivityUpdate, ProjectActivityData } from "../types";

const FOLLOW_THRESHOLD_PX = 40;
const RESYNC_DELAY_MS = 5_000;

export function useActivityStream(initial: ProjectActivityData, query: string) {
  const projectId = initial.project.id;

  const [data, setData] = useState(initial);
  const [connection, setConnection] = useState("Connecting to live updates…");
  const [accessLost, setAccessLost] = useState(false);
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const received = useRef(initial);
  const following = useRef(true);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let source: EventSource | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function receive(snapshot: ProjectActivityData) {
      received.current = snapshot;
      setConnection("Live updates connected");

      if (following.current) {
        setData(snapshot);
        setHasPendingUpdates(false);
        return;
      }

      // Status may update while the log reader stays exactly where they were.
      setData((old) => ({
        ...snapshot,
        deployments: old.deployments.map((row) => {
          const fresh = snapshot.deployments.find((item) => item.id === row.id);

          if (!fresh) return row;

          return {
            ...fresh,
            logText: row.logText,
            logBytes: row.logBytes,
            logTruncated: row.logTruncated,
            logUpdatedAt: row.logUpdatedAt,
          };
        }),
        nextCursor: old.nextCursor,
      }));
      setHasPendingUpdates(true);
    }

    function connect() {
      if (disposed) return;

      const current = new EventSource(
        `/api/projects/${projectId}/activity/stream${query ? `?${query}` : ""}`,
      );
      source = current;

      current.addEventListener("snapshot", (event: MessageEvent<string>) => {
        try {
          receive(JSON.parse(event.data) as ProjectActivityData);
        } catch {
          resync();
        }
      });

      current.addEventListener("update", (event: MessageEvent<string>) => {
        try {
          receive(
            applyActivityUpdate(
              received.current,
              JSON.parse(event.data) as ActivityUpdate,
            ),
          );
        } catch {
          resync();
        }
      });

      current.addEventListener("access-lost", () => {
        current.close();
        setAccessLost(true);
        setConnection(
          "Session expired or project access changed. Sign in or return to the dashboard.",
        );
      });

      current.addEventListener("unavailable", () =>
        setConnection("Connection interrupted. Reconnecting…"),
      );

      current.onerror = () =>
        setConnection("Connection interrupted. Reconnecting…");
    }

    function resync() {
      source?.close();
      setConnection("Restoring log history…");
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, RESYNC_DELAY_MS);
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [projectId, query, attempt]);

  // Keep following the newest output unless the reader scrolled back.
  useEffect(() => {
    const element = viewerRef.current;

    if (following.current && element) element.scrollTop = element.scrollHeight;
  }, [data.deployments]);

  function reconnect() {
    setAccessLost(false);
    setAttempt((value) => value + 1);
  }

  function showLatestOutput() {
    following.current = true;
    setData(received.current);
    setHasPendingUpdates(false);

    if (viewerRef.current) {
      viewerRef.current.scrollTop = viewerRef.current.scrollHeight;
    }
  }

  function handleViewerScroll() {
    const element = viewerRef.current;

    if (element) {
      following.current =
        element.scrollHeight - element.scrollTop - element.clientHeight <
        FOLLOW_THRESHOLD_PX;
    }
  }

  return {
    data,
    connection,
    accessLost,
    hasPendingUpdates,
    reconnect,
    showLatestOutput,
    viewerRef,
    handleViewerScroll,
  };
}