import { NextRequest, NextResponse } from "next/server";

import { createRun, emitEvent } from "@/lib/event-bus";
import { evaluateInsightQuality } from "@/lib/insight-evaluator";
import type {
  InsightEvaluationResult,
  InsightResult,
  NeuralPrediction,
  ScriptExpansion
} from "@/lib/types";

interface EvaluateInsightsRequest {
  runId?: string;
  insightResult: InsightResult;
  neural: NeuralPrediction;
  expanded: ScriptExpansion;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<InsightEvaluationResult | { error: string }>> {
  const body = (await req.json()) as Partial<EvaluateInsightsRequest>;
  const runId = body.runId ?? "standalone-evaluator";

  if (!body.insightResult || !body.neural || !body.expanded) {
    return NextResponse.json({ error: "insightResult, neural, and expanded are required" }, { status: 400 });
  }

  createRun(runId);
  emitEvent(runId, {
    agent: "EVALUATOR",
    status: "running",
    progress: 12,
    message: "Checking insight quality, duplicates, and scene coverage."
  });

  const evaluation = evaluateInsightQuality({
    insightResult: body.insightResult,
    neural: body.neural,
    expanded: body.expanded
  });

  emitEvent(runId, {
    agent: "EVALUATOR",
    status: "complete",
    progress: 100,
    message: evaluation.summary,
    data: evaluation
  });

  return NextResponse.json(evaluation);
}
