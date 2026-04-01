import type { PipelineResult } from "@/lib/types";

// TODO: swap for Redis/Upstash in production.
interface GlobalResultsState {
  __neurodraftResults__?: Map<string, PipelineResult>;
}

const globalResults = globalThis as typeof globalThis & GlobalResultsState;
const results =
  globalResults.__neurodraftResults__ ??
  (globalResults.__neurodraftResults__ = new Map<string, PipelineResult>());

export function storeResult(runId: string, result: Omit<PipelineResult, "runId" | "completedAt">): void {
  const title = result.title ?? result.expanded.title;
  const adCategory = result.ad_category ?? result.expanded.brand_category;

  results.set(runId, {
    ...result,
    title,
    ad_category: adCategory,
    runId,
    completedAt: new Date().toISOString()
  });
}

export function getResult(runId: string): PipelineResult | null {
  return results.get(runId) ?? null;
}
