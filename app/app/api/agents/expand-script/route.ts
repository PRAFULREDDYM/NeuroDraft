import { NextRequest, NextResponse } from "next/server";

import { createRun } from "@/lib/event-bus";
import { expandScript } from "@/lib/pipeline";
import type { ScriptExpansion } from "@/lib/types";

interface ExpandScriptRequest {
  script: string;
  runId?: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ScriptExpansion | { error: string }>> {
  const body = (await req.json()) as Partial<ExpandScriptRequest>;
  const script = body.script?.trim() ?? "";
  const runId = body.runId ?? "standalone-expand";

  if (!script) {
    return NextResponse.json({ error: "Script is required" }, { status: 400 });
  }

  createRun(runId);
  const expanded = await expandScript(runId, script);
  return NextResponse.json(expanded);
}
