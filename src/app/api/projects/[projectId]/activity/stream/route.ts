import { cookies } from "next/headers";
import {
  PROJECT_ID_PATTERN,
  isActivityQueryKey,
  parseActivityQuery,
} from "@/features/deployments/query";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

type Context = { params: Promise<{ projectId: string }> };

const encoder = new TextEncoder();

function eventResponse(event: string) {
  return new Response(`retry: 5000\nevent: ${event}\ndata: {}\n\n`, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-transform",
    },
  });
}

export async function GET(request: Request, context: Context) {
  const { projectId } = await context.params;

  if (!PROJECT_ID_PATTERN.test(projectId)) {
    return new Response(null, { status: 400 });
  }

  const params = new URL(request.url).searchParams;
  const input: Record<string, string> = {};

  for (const key of params.keys()) {
    if (!isActivityQueryKey(key) || params.getAll(key).length !== 1) {
      return new Response(null, { status: 400 });
    }

    input[key] = params.get(key)!;
  }

  const parsed = parseActivityQuery(input);

  if (!parsed.ok) return new Response(null, { status: 400 });

  const query = parsed.query;

  const session = (await cookies()).get(SESSION_COOKIE_NAME);

  if (!session) return eventResponse("access-lost");

  const backendUrl = process.env.BACKEND_URL;
  const appOrigin = process.env.APP_ORIGIN;

  if (!backendUrl || !appOrigin) return eventResponse("unavailable");

  const destination = new URL(
    `/projects/${encodeURIComponent(projectId)}/activity/stream`,
    backendUrl,
  );
  destination.search = query.toString();

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;

  function abort() {
    controller.abort();
  }

  function cleanup() {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
  }

  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) abort();

  timer = setTimeout(abort, 30_000); // Header timeout only; no 30-second stream lifetime.

  try {
    const upstream = await fetch(destination, {
      headers: {
        Accept: "text/event-stream",
        Origin: new URL(appOrigin).origin,
        Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(session.value)}`,
      },
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    if (
      !upstream.ok ||
      !upstream.body ||
      !upstream.headers.get("content-type")?.includes("text/event-stream")
    ) {
      await upstream.body?.cancel();
      cleanup();
      abort();

      return eventResponse(
        [401, 403, 404].includes(upstream.status)
          ? "access-lost"
          : "unavailable",
      );
    }

    clearTimeout(timer);

    const reader = upstream.body.getReader();
    let cancelled = false;

    const stream = new ReadableStream<Uint8Array>({
      async pull(output) {
        timer = setTimeout(abort, 45_000); // Detect a broken upstream; heartbeats reset this.

        try {
          const item = await reader.read();
          clearTimeout(timer);

          if (cancelled) return;

          if (item.done) {
            cleanup();
            output.close();
            reader.releaseLock();
          } else {
            output.enqueue(item.value);
          }
        } catch {
          cleanup();
          abort();

          if (cancelled) return;

          output.enqueue(encoder.encode("event: unavailable\ndata: {}\n\n"));
          output.close();
        }
      },
      async cancel() {
        cancelled = true;
        cleanup();
        abort();
        await reader.cancel().catch(() => {});
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "private, no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    cleanup();
    abort();

    return eventResponse("unavailable");
  }
}