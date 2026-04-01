import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withRetry<T>(
  task: () => Promise<T>,
  retries = 3,
  delayMs = 1200
): Promise<T> {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < retries) {
    try {
      return await task();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown retry error");
      attempt += 1;
      if (attempt >= retries) {
        break;
      }
      await sleep(delayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError ?? new Error("Task failed");
}

export async function withTimeout<T>(
  task: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([task, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatPercentile(value: number): string {
  return `Top ${Math.max(1, 100 - value)}%`;
}

export function extractJsonBlock(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/\{[\s\S]*\}$/);
  return match ? match[0] : trimmed;
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
