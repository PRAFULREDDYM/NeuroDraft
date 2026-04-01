import { NextRequest, NextResponse } from "next/server";

import { createRun } from "@/lib/event-bus";
import { writeInsightsWithGroqRaw } from "@/lib/groq";
import type { InsightResult, NeuralPrediction, ScriptExpansion } from "@/lib/types";

interface WriteInsightsRequest {
  neural: NeuralPrediction;
  expanded: ScriptExpansion;
  runId?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<InsightResult | { error: string }>> {
  const body = (await req.json()) as Partial<WriteInsightsRequest>;
  const runId = body.runId ?? "standalone-insights";

  if (!body.neural || !body.expanded) {
    return NextResponse.json({ error: "neural and expanded are required" }, { status: 400 });
  }

  createRun(runId);
  const { rawContent, result } = await writeInsightsWithGroqRaw({
    neural: body.neural,
    expanded: body.expanded
  });
  console.log("[INSIGHT_WRITER] raw response:", rawContent);
  return NextResponse.json(result);
}
