import { subscribeToRun } from "@/lib/event-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return new Response("Missing runId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: unknown): void => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 15_000);

      const { replay, unsubscribe } = subscribeToRun(runId, (event) => {
        send(event);
      });

      replay.forEach((event) => send(event));

      const abortHandler = (): void => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      };

      req.signal.addEventListener("abort", abortHandler);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
