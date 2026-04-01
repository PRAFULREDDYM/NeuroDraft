import { headers } from "next/headers";

import { ResultsShell } from "@/components/pipeline/ResultsShell";

export const dynamic = "force-dynamic";
import type { PipelineResult, ResultsResponse } from "@/lib/types";

async function getInitialResult(id: string): Promise<PipelineResult | null> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");

  if (!host) {
    return null;
  }

  const protocol = host.includes("localhost") ? "http" : "https";

  try {
    const response = await fetch(`${protocol}://${host}/api/results/${encodeURIComponent(id)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ResultsResponse;
    return payload.result;
  } catch {
    return null;
  }
}

export default async function ResultsPage(props: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const params = await props.params;
  const initialResult = await getInitialResult(params.id);

  return (
    <main className="min-h-screen neuro-grid">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ResultsShell initialResult={initialResult} runId={params.id} />
      </div>
    </main>
  );
}
