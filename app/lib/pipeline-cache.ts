interface CacheEntry<T> {
  expiresAt: number;
  value: Promise<T>;
}

interface CacheStats {
  hits: number;
  misses: number;
  callsByBucket: Record<string, number>;
}

interface GlobalPipelineCacheState {
  __neurodraftPipelineCache__?: Map<string, CacheEntry<unknown>>;
  __neurodraftPipelineCacheStats__?: CacheStats;
}

const globalCache = globalThis as typeof globalThis & GlobalPipelineCacheState;

const cache =
  globalCache.__neurodraftPipelineCache__ ??
  (globalCache.__neurodraftPipelineCache__ = new Map<string, CacheEntry<unknown>>());

const stats =
  globalCache.__neurodraftPipelineCacheStats__ ??
  (globalCache.__neurodraftPipelineCacheStats__ = {
    hits: 0,
    misses: 0,
    callsByBucket: {}
  });

function normalizeKey(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => normalizeKey(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${normalizeKey(entryValue)}`).join(",")}}`;
}

export function createPipelineCacheKey(parts: unknown[]): string {
  return normalizeKey(parts);
}

export async function cacheAsync<T>(
  bucket: string,
  keyParts: unknown[],
  task: () => Promise<T>,
  ttlMs = 10 * 60_000
): Promise<T> {
  const key = `${bucket}:${createPipelineCacheKey(keyParts)}`;
  const now = Date.now();
  const existing = cache.get(key);

  if (existing && existing.expiresAt > now) {
    stats.hits += 1;
    return existing.value as Promise<T>;
  }

  stats.misses += 1;
  stats.callsByBucket[bucket] = (stats.callsByBucket[bucket] ?? 0) + 1;

  const value = task().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, {
    expiresAt: now + ttlMs,
    value
  });

  return value;
}

export function getPipelineCacheStats(): CacheStats {
  return {
    hits: stats.hits,
    misses: stats.misses,
    callsByBucket: { ...stats.callsByBucket }
  };
}

export function resetPipelineCache(): void {
  cache.clear();
  stats.hits = 0;
  stats.misses = 0;
  stats.callsByBucket = {};
}
