import { NextRequest, NextResponse } from "next/server";

import { createRun } from "@/lib/event-bus";
import { directScenes } from "@/lib/pipeline";
import type { DirectedScene, Scene, ScriptExpansion } from "@/lib/types";

interface DirectScenesRequest {
  scenes: Scene[];
  runId?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<DirectedScene[] | { error: string }>> {
  const body = (await req.json()) as Partial<DirectScenesRequest>;
  const scenes = body.scenes ?? [];
  const runId = body.runId ?? "standalone-direct";

  if (scenes.length === 0) {
    return NextResponse.json({ error: "Scenes are required" }, { status: 400 });
  }

  createRun(runId);

  const expanded: ScriptExpansion = {
    title: "Ad",
    duration_seconds: scenes[scenes.length - 1]?.end_time ?? 30,
    scenes,
    full_voiceover_script: scenes.map((scene) => scene.voiceover).join(" "),
    target_emotion: "Trust",
    brand_category: "General"
  };

  const directed = await directScenes(runId, expanded);
  return NextResponse.json(directed);
}
