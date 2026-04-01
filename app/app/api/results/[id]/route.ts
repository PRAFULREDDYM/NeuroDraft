import { NextRequest, NextResponse } from "next/server";

import { getResult } from "@/lib/results-store";
import type { ResultsResponse } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ResultsResponse>> {
  const params = await context.params;
  const result = getResult(params.id);

  return NextResponse.json({
    result,
    title: result?.title,
    ad_category: result?.ad_category,
    neural: result?.neural,
    insights: result?.insights,
    video: result?.video,
    evaluation: result?.evaluation
  });
}
