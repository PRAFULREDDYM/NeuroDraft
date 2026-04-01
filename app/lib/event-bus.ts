import type { PipelineEvent } from "@/lib/types";

type Listener = (event: PipelineEvent) => void;

interface RunChannel {
  events: PipelineEvent[];
  listeners: Set<Listener>;
}

interface GlobalEventBusState {
  __neurodraftChannels__?: Map<string, RunChannel>;
}

const globalEventBus = globalThis as typeof globalThis & GlobalEventBusState;
const channels =
  globalEventBus.__neurodraftChannels__ ??
  (globalEventBus.__neurodraftChannels__ = new Map<string, RunChannel>());

function getChannel(runId: string): RunChannel {
  let channel = channels.get(runId);
  if (!channel) {
    channel = { events: [], listeners: new Set<Listener>() };
    channels.set(runId, channel);
  }
  return channel;
}

export function createRun(runId: string): void {
  getChannel(runId);
}

export function emitEvent(runId: string, event: Omit<PipelineEvent, "runId" | "timestamp">): void {
  const channel = getChannel(runId);
  const fullEvent: PipelineEvent = {
    ...event,
    type: event.type ?? "agent_event",
    runId,
    timestamp: new Date().toISOString()
  };

  channel.events.push(fullEvent);
  channel.listeners.forEach((listener) => listener(fullEvent));
}

export function subscribeToRun(
  runId: string,
  listener: Listener
): { unsubscribe: () => void; replay: PipelineEvent[] } {
  const channel = getChannel(runId);
  channel.listeners.add(listener);

  return {
    replay: [...channel.events],
    unsubscribe: () => {
      channel.listeners.delete(listener);
    }
  };
}
