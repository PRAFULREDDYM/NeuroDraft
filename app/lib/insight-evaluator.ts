import type {
  Insight,
  InsightEvaluationIssue,
  InsightEvaluationResult,
  InsightResult,
  NeuralPrediction,
  ScriptExpansion
} from "@/lib/types";

interface UniqueInsightResult {
  insights: Insight[];
  duplicateCount: number;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function insightSignature(insight: Insight): string {
  return [
    normalizeText(insight.title),
    normalizeText(insight.finding),
    normalizeText(insight.recommendation),
    normalizeText(insight.metric_affected),
    String(insight.scene_ref)
  ].join("|");
}

export function uniquifyInsights(insights: Insight[]): UniqueInsightResult {
  const unique: Insight[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;

  for (const insight of insights) {
    const signature = insightSignature(insight);
    if (seen.has(signature)) {
      duplicateCount += 1;
      continue;
    }

    seen.add(signature);
    unique.push(insight);
  }

  return {
    duplicateCount,
    insights: unique.map((insight, index) => ({
      ...insight,
      id: `insight_${index + 1}`
    }))
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildIssueSummary(issues: InsightEvaluationIssue[]): string {
  if (issues.length === 0) {
    return "Insight quality check passed with no major issues.";
  }

  const headline = issues.length === 1 ? issues[0]?.message : `${issues.length} quality issues detected.`;
  const recommendation = issues[0]?.message ?? "Review the insight set for coverage gaps.";
  return `${headline} ${recommendation}`.trim();
}

export function evaluateInsightQuality(input: {
  insightResult: InsightResult;
  neural: NeuralPrediction;
  expanded: ScriptExpansion;
}): InsightEvaluationResult {
  const unique = uniquifyInsights(input.insightResult.insights);
  const issues: InsightEvaluationIssue[] = [];
  const neuralIssues: string[] = [];
  const insightIssues: string[] = [];

  if (!input.neural.segments.length) {
    neuralIssues.push("No segments returned");
  }

  if (input.neural.segments.length !== input.expanded.scenes.length) {
    neuralIssues.push(`Segment count (${input.neural.segments.length}) doesn't match scenes (${input.expanded.scenes.length})`);
  }

  for (const segment of input.neural.segments) {
    for (const [key, value] of Object.entries(segment.neural_scores)) {
      if (typeof value !== "number" || value < 0 || value > 1) {
        neuralIssues.push(`Score out of range: ${key} = ${String(value)}`);
      }
    }
  }

  if (unique.duplicateCount > 0) {
    insightIssues.push(`${unique.duplicateCount} duplicate insights detected`);
    issues.push({
      code: "duplicate_insight",
      severity: "warning",
      message: `${unique.duplicateCount} duplicate insight${unique.duplicateCount === 1 ? "" : "s"} were removed during normalization.`
    });
  }

  if (unique.insights.length < 5) {
    insightIssues.push(`Only ${unique.insights.length} unique insights remain`);
    issues.push({
      code: "insight_count",
      severity: "warning",
      message: `Only ${unique.insights.length} unique insight${unique.insights.length === 1 ? "" : "s"} remain after cleanup.`
    });
  }

  if (!input.insightResult.rewrite_suggestion) {
    insightIssues.push("Missing rewrite suggestion");
    issues.push({
      code: "missing_rewrite",
      severity: "info",
      message: "No rewrite suggestion was generated for the weakest scene."
    });
  }

  if (!Array.isArray(input.insightResult.headline_test) || input.insightResult.headline_test.length < 3) {
    insightIssues.push("Headline recall test is incomplete");
    issues.push({
      code: "missing_headline_test",
      severity: "info",
      message: "Headline test coverage is incomplete."
    });
  }

  for (const insight of unique.insights) {
    if (
      !insight.title.trim() ||
      !insight.finding.trim() ||
      !insight.recommendation.trim() ||
      !insight.metric_affected.trim()
    ) {
      insightIssues.push(`Insight ${insight.id} contains a blank field`);
      issues.push({
        code: "blank_field",
        severity: "error",
        insight_id: insight.id,
        message: `Insight ${insight.id} contains a blank field.`
      });
    }

    if (insight.scene_ref < 1 || insight.scene_ref > input.expanded.scenes.length) {
      insightIssues.push(`Insight ${insight.id} points outside the scene range`);
      issues.push({
        code: "invalid_scene_ref",
        severity: "warning",
        insight_id: insight.id,
        message: `Insight ${insight.id} points outside the scene range.`
      });
    }
  }

  const sceneCount = input.expanded.scenes.length;
  const coverageScore = sceneCount > 0 ? Math.min(1, unique.insights.length / Math.min(sceneCount, 5)) : 0;
  const duplicatePenalty = unique.duplicateCount * 14;
  const insightCountPenalty = unique.insights.length < 5 ? (5 - unique.insights.length) * 12 : 0;
  const issuePenalty = issues.filter((issue) => issue.severity === "error").length * 10;
  const warningPenalty = issues.filter((issue) => issue.severity === "warning").length * 4;
  const neuralPenalty = neuralIssues.length * 15;
  const qualityScore = clampScore(
    100 * coverageScore - duplicatePenalty - insightCountPenalty - issuePenalty - warningPenalty - neuralPenalty
  );

  return {
    status: qualityScore >= 80 && issues.length === 0 ? "pass" : "warn",
    neural_valid: neuralIssues.length === 0,
    insights_valid: insightIssues.length === 0,
    neural_issues: neuralIssues,
    insights_issues: insightIssues,
    score: qualityScore,
    quality_score: qualityScore,
    insight_count: input.insightResult.insights.length,
    unique_insight_count: unique.insights.length,
    duplicate_count: unique.duplicateCount,
    needs_retry: qualityScore < 80 || unique.insights.length < 5 || unique.duplicateCount > 0,
    summary: buildIssueSummary(issues),
    recommendation:
      unique.insights.length < 5
        ? "Add or recover missing insights before publishing the result."
        : unique.duplicateCount > 0
          ? "Keep the normalized insight set and rerun if the model repeats itself."
          : "The insight set is ready to share with the creative team.",
    issues
  };
}
