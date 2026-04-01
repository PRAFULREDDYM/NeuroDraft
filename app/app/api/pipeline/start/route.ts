import { after, NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { createRun, emitEvent } from "@/lib/event-bus";
import { runPipeline } from "@/lib/pipeline";
import type { StartPipelineRequest, StartPipelineResponse } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse<StartPipelineResponse | { error: string }>> {
  const body = (await req.json()) as Partial<StartPipelineRequest>;
  const script = body.script?.trim() ?? "";
  const fileId = body.fileId?.trim() ?? "";
  const uploadType = body.uploadType;

  if (script.length < 50) {
    return NextResponse.json({ error: "Script too short" }, { status: 400 });
  }

  if (script.length > 5000) {
    return NextResponse.json({ error: "Script too long" }, { status: 400 });
  }

  const runId = nanoid();
  createRun(runId);

  after(() => {
    void runPipeline(runId, {
      script,
      fileId: fileId.length > 0 ? fileId : undefined,
      uploadType
    }).catch((error) => {
      emitEvent(runId, {
        agent: "INSIGHT_WRITER",
        status: "error",
        progress: 100,
        message: "Pipeline failed to complete.",
        type: "pipeline_error",
        error: error instanceof Error ? error.message : "Unknown pipeline error"
      });
    });
  });

  return NextResponse.json({ runId });
}
