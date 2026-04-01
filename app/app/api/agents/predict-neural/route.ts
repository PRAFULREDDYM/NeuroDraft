import { NextRequest, NextResponse } from "next/server";

import { createRun } from "@/lib/event-bus";
import { predictNeural } from "@/lib/pipeline";
import type { AudioResult, DirectedScene, NeuralPrediction, ScriptExpansion, VideoResult } from "@/lib/types";

interface PredictNeuralRequest {
  expanded: ScriptExpansion;
  directed: DirectedScene[];
  audio: AudioResult;
  video: VideoResult;
  runId?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<NeuralPrediction | { error: string }>> {
  const body = (await req.json()) as Partial<PredictNeuralRequest>;
  const runId = body.runId ?? "standalone-neural";

  if (!body.expanded || !body.directed || !body.audio || !body.video) {
    return NextResponse.json({ error: "expanded, directed, audio, and video are required" }, { status: 400 });
  }

  createRun(runId);
  const neural = await predictNeural(runId, {
    expanded: body.expanded,
    directed: body.directed,
    audio: body.audio,
    video: body.video
  });

  return NextResponse.json(neural);
}
