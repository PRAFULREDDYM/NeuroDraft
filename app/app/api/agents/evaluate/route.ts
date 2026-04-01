import { NextRequest, NextResponse } from "next/server";

import { createRun } from "@/lib/event-bus";
import { evaluateInsightQuality } from "@/lib/insight-evaluator";
import type {
  InsightEvaluationResult,
  InsightResult,
  NeuralPrediction,
  ScriptExpansion
} from "@/lib/types";

interface EvaluateRequest {
  neural: NeuralPrediction;
  insights: InsightResult;
  expanded: ScriptExpansion;
  runId?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<InsightEvaluationResult | { error: string }>> {
  const body = (await request.json()) as Partial<EvaluateRequest>;
  const runId = body.runId ?? "standalone-evaluator";

  if (!body.neural || !body.insights || !body.expanded) {
    return NextResponse.json({ error: "neural, insights, and expanded are required" }, { status: 400 });
  }

  createRun(runId);

  return NextResponse.json(
    evaluateInsightQuality({
      neural: body.neural,
      insightResult: body.insights,
      expanded: body.expanded
    })
  );
}
