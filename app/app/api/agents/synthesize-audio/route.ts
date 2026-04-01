import { NextRequest, NextResponse } from "next/server";

import { createRun } from "@/lib/event-bus";
import { synthesizeAudio } from "@/lib/pipeline";
import type { AudioResult } from "@/lib/types";

interface SynthesizeAudioRequest {
  script: string;
  runId?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<AudioResult | { error: string }>> {
  const body = (await req.json()) as Partial<SynthesizeAudioRequest>;
  const script = body.script?.trim() ?? "";
  const runId = body.runId ?? "standalone-audio";

  if (!script) {
    return NextResponse.json({ error: "Script is required" }, { status: 400 });
  }

  createRun(runId);
  const audio = await synthesizeAudio(runId, script);
  return NextResponse.json(audio);
}
