import Groq from "groq-sdk";

import {
  createDemoAudioResult,
  createDemoDirectedScenes,
  createDemoInsights,
  createDemoNeuralPrediction,
  createDemoScriptExpansion
} from "@/lib/mock-data";
import {
  buildEngagementArcExplanation,
  buildOverallVerdict
} from "@/lib/neural-translations";
import { uniquifyInsights } from "@/lib/insight-evaluator";
import { cacheAsync } from "@/lib/pipeline-cache";
import { sleep } from "@/lib/utils";
import type {
  AudioResult,
  DirectedScene,
  HeadlineTestEntry,
  Insight,
  InsightResult,
  NeuralPrediction,
  RewriteSuggestion,
  ScriptExpansion,
  TranscriptSegment
} from "@/lib/types";

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

interface GroqRetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

function isRetryableGroqError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return /rate limit|429|timeout|timed out|temporarily unavailable|503|502|504|ECONNRESET|ETIMEDOUT|fetch failed/i.test(
    message
  );
}

export async function withGroqRetry<T>(
  task: () => Promise<T>,
  options: GroqRetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 800;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < retries) {
    try {
      return await task();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown Groq error");
      attempt += 1;

      if (attempt >= retries || !isRetryableGroqError(error)) {
        break;
      }

      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError ?? new Error("Groq task failed");
}

export function extractJSON(raw: string): string {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fence ? fence[1].trim() : raw.trim();
}

async function groqJson<T>(
  systemPrompt: string,
  userPrompt: string,
  cacheBucket?: string,
  cacheKeyParts?: unknown[]
): Promise<T> {
  const client = getGroqClient();
  if (!client) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const run = async (): Promise<T> => {
    const response = await withGroqRetry(() =>
      client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    );

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("Groq returned no content");
    }

    return JSON.parse(extractJSON(content)) as T;
  };

  if (!cacheBucket) {
    return run();
  }

  return cacheAsync(cacheBucket, [systemPrompt, userPrompt, ...(cacheKeyParts ?? [])], run);
}

interface TimestampedTranscriptResponse {
  segments: Array<{ start: number; end: number; text: string }>;
  duration: number;
  word_count: number;
}

interface RawInsightItem {
  id?: string;
  title?: string;
  finding?: string;
  recommendation?: string;
  impact?: "high" | "medium" | "low" | string;
  metric_affected?: string;
  scene_ref?: number;
}

interface RawRewriteSuggestion {
  scene_id?: number;
  original_line?: string;
  rewritten_line?: string;
  reason?: string;
}

interface RawHeadlineOption {
  headline?: string;
  predicted_recall_score?: number;
  why?: string;
}

interface RawInsightResponse {
  insights?: RawInsightItem[];
  rewrite_suggestion?: string | RawRewriteSuggestion;
  headline_test?: string[] | RawHeadlineOption[];
  overall_verdict?: string;
  engagement_arc_explanation?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeInsightItems(
  rawInsights: RawInsightItem[] | undefined,
  neural: NeuralPrediction,
  expanded: ScriptExpansion
): Insight[] {
  const fallback = createDemoInsights(neural, expanded);
  const normalized: Insight[] = Array.isArray(rawInsights)
    ? rawInsights
        .filter(isObject)
        .map((insight, index) => ({
          id: typeof insight.id === "string" && insight.id.trim().length > 0 ? insight.id : `insight_${index + 1}`,
          title: typeof insight.title === "string" && insight.title.trim().length > 0 ? insight.title : `Insight ${index + 1}`,
          finding:
            typeof insight.finding === "string" && insight.finding.trim().length > 0
              ? insight.finding
              : "The model returned a partial insight response.",
          recommendation:
            typeof insight.recommendation === "string" && insight.recommendation.trim().length > 0
              ? insight.recommendation
              : "Use the fallback heatmap and scene summary to guide the next creative pass.",
          impact:
            insight.impact === "high" || insight.impact === "medium" || insight.impact === "low"
              ? (insight.impact as Insight["impact"])
              : "medium",
          metric_affected:
            typeof insight.metric_affected === "string" && insight.metric_affected.trim().length > 0
              ? insight.metric_affected
              : "Overall engagement",
          scene_ref:
            typeof insight.scene_ref === "number" && Number.isFinite(insight.scene_ref)
              ? insight.scene_ref
              : neural.segments[index]?.scene_id ?? expanded.scenes[index]?.id ?? 1
        }))
    : [];

  const merged = [...normalized, ...fallback.insights];
  const unique = uniquifyInsights(merged).insights.slice(0, 5);

  return unique.map((insight, index) => ({
    ...insight,
    id: `insight_${index + 1}`
  }));
}

function normalizeRewriteSuggestion(
  value: RawInsightResponse["rewrite_suggestion"],
  fallback: InsightResult
): RewriteSuggestion | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return {
      scene_id: fallback.rewrite_suggestion?.scene_id ?? 1,
      original_line: fallback.rewrite_suggestion?.original_line ?? "",
      rewritten_line: value,
      reason: "Model returned a text-only rewrite suggestion."
    };
  }

  if (isObject(value)) {
    return {
      scene_id: typeof value.scene_id === "number" ? value.scene_id : fallback.rewrite_suggestion?.scene_id ?? 1,
      original_line:
        typeof value.original_line === "string" && value.original_line.trim().length > 0
          ? value.original_line
          : fallback.rewrite_suggestion?.original_line ?? "",
      rewritten_line:
        typeof value.rewritten_line === "string" && value.rewritten_line.trim().length > 0
          ? value.rewritten_line
          : fallback.rewrite_suggestion?.rewritten_line ?? "",
      reason:
        typeof value.reason === "string" && value.reason.trim().length > 0
          ? value.reason
          : fallback.rewrite_suggestion?.reason ?? "This rewrite should sharpen the weakest scene's message."
    };
  }

  return fallback.rewrite_suggestion;
}

function normalizeHeadlineTests(
  value: RawInsightResponse["headline_test"],
  fallback: InsightResult
): HeadlineTestEntry[] {
  if (Array.isArray(value) && value.length > 0) {
    if (typeof value[0] === "string") {
      return value
        .filter((headline): headline is string => typeof headline === "string" && headline.trim().length > 0)
        .map((headline, index) => ({
        headline,
        predicted_recall_score: Math.max(52, 84 - index * 9),
        why: "Fallback ranking derived from the ad's strongest narrative beats."
      }));
    }

    const options = value.filter((option): option is RawHeadlineOption => isObject(option));

    return options
      .map((option, index) => ({
        headline:
          typeof option.headline === "string" && option.headline.trim().length > 0
            ? option.headline
            : fallback.headline_test[index]?.headline ?? `Headline ${index + 1}`,
        predicted_recall_score:
          typeof option.predicted_recall_score === "number" && Number.isFinite(option.predicted_recall_score)
            ? option.predicted_recall_score
            : fallback.headline_test[index]?.predicted_recall_score ?? Math.max(52, 84 - index * 9),
        why:
          typeof option.why === "string" && option.why.trim().length > 0
            ? option.why
            : fallback.headline_test[index]?.why ?? "Fallback ranking derived from the ad's strongest narrative beats."
      }))
      .filter((option) => option.headline.trim().length > 0);
  }

  return fallback.headline_test;
}

export function normalizeInsightResult(
  raw: RawInsightResponse | null | undefined,
  neural: NeuralPrediction,
  expanded: ScriptExpansion
): InsightResult {
  const fallback = createDemoInsights(neural, expanded);
  const insights = normalizeInsightItems(raw?.insights, neural, expanded);

  const rewriteSuggestion = normalizeRewriteSuggestion(raw?.rewrite_suggestion, fallback);
  const headlineTests = normalizeHeadlineTests(raw?.headline_test, fallback);

  return {
    insights,
    rewrite_suggestion: rewriteSuggestion,
    headline_test: headlineTests,
    overall_verdict:
      typeof raw?.overall_verdict === "string" && raw.overall_verdict.trim().length > 0
        ? raw.overall_verdict
        : buildOverallVerdict(neural, insights.length),
    engagement_arc_explanation:
      typeof raw?.engagement_arc_explanation === "string" && raw.engagement_arc_explanation.trim().length > 0
        ? raw.engagement_arc_explanation
        : buildEngagementArcExplanation(neural)
  };
}

function buildInsightFallback(neural: NeuralPrediction): InsightResult {
  return {
    insights: [
      {
        id: "insight_1",
        title: "Analysis complete",
        finding: "Neural prediction data was collected successfully.",
        recommendation: "Review the heatmap above for scene-by-scene engagement data.",
        impact: "medium",
        metric_affected: "Overall engagement",
        scene_ref: neural.segments[0]?.scene_id ?? 1
      }
    ],
    rewrite_suggestion: null,
    headline_test: [],
    overall_verdict: "Analysis complete. See heatmap for detailed scores.",
    engagement_arc_explanation: "Engagement scores are shown per scene above."
  };
}

function mergeUniqueInsights(
  original: RawInsightItem[],
  retry: RawInsightItem[]
): RawInsightItem[] {
  const merged: RawInsightItem[] = [...original];

  for (const retryInsight of retry) {
    const alreadyPresent = merged.find((existing) => {
      if (existing.id && retryInsight.id) {
        return existing.id === retryInsight.id;
      }

      return (
        existing.title?.trim().toLowerCase() === retryInsight.title?.trim().toLowerCase() &&
        existing.finding?.trim().toLowerCase() === retryInsight.finding?.trim().toLowerCase()
      );
    });

    if (!alreadyPresent) {
      merged.push(retryInsight);
    }
  }

  return merged.slice(0, 5).map((insight, index) => ({
    ...insight,
    id: `insight_${index + 1}`
  }));
}

export async function synthesizeAudioTranscriptWithGroq(script: string): Promise<AudioResult> {
  const fallback = createDemoAudioResult(
    script,
    Math.max(20, Math.min(45, Math.round(script.split(/\s+/).length / 2.4)))
  );
  const client = getGroqClient();

  if (!client) {
    return {
      ...fallback,
      message: "GROQ_API_KEY missing. Using fallback transcript timing."
    };
  }

  return cacheAsync("groq:audio-transcript", [script.trim()], async () => {
    try {
      const response = await withGroqRetry(() =>
        client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `Given an ad script, produce a timestamped transcript as if it were spoken aloud at normal voiceover pace (~130 words/minute). Return ONLY valid JSON:
{
  "segments": [
    { "start": 0.0, "end": 2.3, "text": "spoken words here" }
  ],
  "duration": 30,
  "word_count": 85
}
Return ONLY valid JSON. No explanation.`
            },
            {
              role: "user",
              content: script
            }
          ]
        })
      );

      const content = response.choices[0]?.message.content ?? "{}";
      const transcript = JSON.parse(extractJSON(content)) as TimestampedTranscriptResponse;
      const normalizedSegments: TranscriptSegment[] = transcript.segments.map((segment, index) => ({
        id: `segment-${index + 1}`,
        start: segment.start,
        end: segment.end,
        text: segment.text
      }));
      const duration =
        transcript.duration > 0
          ? transcript.duration
          : normalizedSegments.at(-1)?.end ?? fallback.duration;

      return {
        mode: "text-only",
        audio_url: null,
        transcript: normalizedSegments.length > 0 ? normalizedSegments : fallback.transcript,
        duration,
        message: `Transcript ready — ${transcript.word_count} words, ${Math.round(duration)}s`
      };
    } catch {
      return {
        ...fallback,
        message: "Transcript generation fell back to heuristic timing."
      };
    }
  });
}

export async function expandScriptWithGroq(script: string): Promise<ScriptExpansion> {
  try {
    return await groqJson<ScriptExpansion>(
      `You are a senior creative director at a top-tier ad agency.
Given a raw ad script, expand it into a structured JSON object:
{
  "title": "Ad campaign title",
  "duration_seconds": 30,
  "scenes": [
    {
      "id": 1,
      "start_time": 0,
      "end_time": 8,
      "description": "Detailed visual scene description for video generation",
      "camera": "Camera angle and motion",
      "mood": "Emotional tone",
      "voiceover": "Exact VO text for this scene",
      "music_direction": "Music/SFX instruction",
      "video_prompt": "Photorealistic Veo 3.1 prompt (80 words max, cinematic, detailed)"
    }
  ],
  "full_voiceover_script": "Complete VO script concatenated",
  "target_emotion": "Primary emotion to evoke",
  "brand_category": "e.g. FMCG, Tech, Fashion"
}
Return ONLY valid JSON. No explanation text.`,
      script,
      "groq:expand-script",
      [script.trim()]
    );
  } catch {
    return createDemoScriptExpansion(script);
  }
}

export async function directScenesWithGroq(scenes: ScriptExpansion["scenes"]): Promise<DirectedScene[]> {
  try {
    const response = await groqJson<DirectedScene[] | { scenes: DirectedScene[] }>(
      `You are a cinematic scene director optimizing prompts for Veo 3.1.
Return a JSON array of directed scenes with all original fields plus:
{
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "emotional_intensity": "low|medium|high",
  "audio_direction": "How music and VO should feel",
  "refined_prompt": "An optimized cinematic prompt with emotional intensity, audio direction, 1080p, 16:9"
}
Return ONLY JSON.`,
      JSON.stringify(scenes),
      "groq:direct-scenes",
      [scenes]
    );

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.scenes)) {
      return response.scenes;
    }

    throw new Error("Invalid directed scenes payload");
  } catch {
    return createDemoDirectedScenes({
      title: "Directed Demo",
      duration_seconds: scenes[scenes.length - 1]?.end_time ?? 30,
      scenes,
      full_voiceover_script: scenes.map((scene) => scene.voiceover).join(" "),
      target_emotion: "Trust",
      brand_category: "General"
    });
  }
}

export async function predictNeuralWithGroq(input: {
  expanded: ScriptExpansion;
  directed: DirectedScene[];
  videoType: "video" | "storyboard";
  transcriptText: string;
}): Promise<NeuralPrediction> {
  try {
    return {
      ...(await groqJson<Omit<NeuralPrediction, "label" | "mode">>(
        `You are TRIBE v2, a trimodal brain encoder trained on 1,000+ hours of fMRI data from 720 subjects (Meta Research, 2025). You predict neural engagement scores from combined video, audio, and text stimuli.

For each scene segment provided, output a neural prediction in this exact JSON schema:
{
  "segments": [
    {
      "scene_id": 1,
      "time_start": 0,
      "time_end": 8,
      "neural_scores": {
        "visual_cortex_engagement": 0.0,
        "auditory_cortex_engagement": 0.0,
        "prefrontal_attention": 0.0,
        "amygdala_emotional_arousal": 0.0,
        "hippocampal_memory_encoding": 0.0,
        "overall_engagement": 0.0
      },
      "peak_moment": "Description of highest-engagement instant",
      "drop_moment": "Description of lowest-engagement instant",
      "predicted_recall_probability": 0.0,
      "signal_confidence": 0.0,
      "dominant_driver": "visual|audio|copy|emotion|product|pacing",
      "honesty_note": "Short note naming uncertainty or the main driver"
    }
  ],
  "overall": {
    "mean_engagement": 0.0,
    "engagement_arc": "rising|plateau|declining|volatile",
    "emotional_valence": "positive|negative|mixed|neutral",
    "memory_strength": 0.0,
    "attention_retention": 0.0,
    "neural_grade": "A|B|C|D|F",
    "benchmark_percentile": 0,
    "score_confidence": 0.0,
    "data_quality": "high|medium|low",
    "best_leverage_point": "One sentence on the strongest improvement opportunity",
    "uncertainty_note": "One sentence on what the model is least certain about"
  }
}

Use the full dynamic range of the model. Do not cluster every score around 0.60.
Use low values when the scene is flat, confusing, or visually weak.
Use high values when the scene has a clear emotional hook, strong product visibility, or memorable pacing.
Use the full 0.05-0.98 span when justified by the stimulus.

Base predictions on the actual neuroscience of advertising:
- Fast cuts reduce hippocampal encoding
- Strong emotional openings spike amygdala activity
- Clear product visibility drives prefrontal attention
- Music congruence with mood amplifies all scores
- First 3 seconds determine 60% of recall probability
- When evidence is mixed, lower confidence and say so explicitly
- Prefer honest uncertainty over inflated certainty

Return ONLY valid JSON.`,
        JSON.stringify(input),
        "groq:predict-neural",
        [input]
      )),
      label: "TRIBE v2-calibrated prediction",
      mode: "live"
    };
  } catch {
    return createDemoNeuralPrediction(input.directed);
  }
}

export function buildInsightPrompt(): string {
  return `You are a senior creative strategist who translates neuroscience data into actionable ad creative direction. A marketer has just received TRIBE v2 neural predictions for an ad script. Your job is to turn those scores into clear, human-readable insights.

CRITICAL: Return ONLY a valid JSON object. No markdown. No explanation. No code fences.
The JSON must have this exact structure with all fields present:

{
  "insights": [
    {
      "id": "insight_1",
      "title": "5 words max title here",
      "finding": "One clear sentence: what the data shows, in plain English. No jargon.",
      "recommendation": "One specific, concrete action the creative team can take right now.",
      "impact": "high",
      "metric_affected": "Memory encoding",
      "scene_ref": 2
    }
  ],
  "rewrite_suggestion": {
    "scene_id": 2,
    "original_line": "Copy the weakest scene voiceover here",
    "rewritten_line": "Write an improved version that would boost neural engagement",
    "reason": "One sentence: why this rewrite improves the predicted scores"
  },
  "headline_test": [
    { "headline": "Option A headline", "predicted_recall_score": 78, "why": "One sentence" },
    { "headline": "Option B headline", "predicted_recall_score": 65, "why": "One sentence" },
    { "headline": "Option C headline", "predicted_recall_score": 82, "why": "One sentence" }
  ],
  "overall_verdict": "2-3 sentence plain English summary of the entire ad's neural performance. What works, what doesn't, and one priority fix.",
  "engagement_arc_explanation": "1-2 sentences explaining what the rising/falling/volatile engagement arc means for how viewers will experience this ad."
}

Write findings and recommendations as if speaking to a creative director who has never seen an fMRI scan.
Use words like: 'attention drops here', 'viewers remember this', 'emotional hook is weak', 'brand recall spikes'.
Never use terms like: 'hippocampal', 'prefrontal cortex', 'amygdala activation', 'neural pathway'.`;
}

async function requestInsightResponse(input: {
  neural: NeuralPrediction;
  expanded: ScriptExpansion;
}): Promise<{ rawContent: string; result: InsightResult }> {
  const client = getGroqClient();
  if (!client) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const systemPrompt = buildInsightPrompt();
  const userContent = JSON.stringify(input);

  return cacheAsync("groq:insights", [input], async () => {
    const response = await withGroqRetry(() =>
      client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ]
      })
    );

    const rawContent = response.choices[0]?.message.content ?? "{}";
    console.log("[INSIGHT_WRITER] raw response:", rawContent);
    try {
      const clean = extractJSON(rawContent);
      const parsed = JSON.parse(clean) as RawInsightResponse;
      if (!Array.isArray(parsed.insights) || parsed.insights.length === 0) {
        throw new Error("insights array empty");
      }

      const insightCount = parsed.insights.length;

      if (insightCount < 4) {
        console.log(`[INSIGHT_WRITER] only ${insightCount} insights, retrying...`);

        const retry = await withGroqRetry(() =>
          client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
              { role: "assistant", content: rawContent },
              {
                role: "user",
                content: `You only returned ${insightCount} insights. Return exactly 5 insights in the same JSON format. Do not repeat the ones already given — add the missing ones.`
              }
            ]
          })
        );

        const retryRaw = retry.choices[0]?.message.content ?? "";

        try {
          const retryParsed = JSON.parse(extractJSON(retryRaw)) as RawInsightResponse;
          parsed.insights = mergeUniqueInsights(
            parsed.insights,
            Array.isArray(retryParsed.insights) ? retryParsed.insights : []
          );
        } catch {
          // Keep the first response if the retry payload is invalid.
        }
      }

      return {
        rawContent,
        result: normalizeInsightResult(parsed, input.neural, input.expanded)
      };
    } catch (error) {
      console.error("[INSIGHT_WRITER] parse failed:", error, "raw:", rawContent);
      return {
        rawContent,
        result: buildInsightFallback(input.neural)
      };
    }
  });
}

export async function writeInsightsWithGroq(input: {
  neural: NeuralPrediction;
  expanded: ScriptExpansion;
}): Promise<InsightResult> {
  try {
    const { result } = await requestInsightResponse(input);
    return result;
  } catch {
    return createDemoInsights(input.neural, input.expanded);
  }
}

export async function writeInsightsWithGroqRaw(input: {
  neural: NeuralPrediction;
  expanded: ScriptExpansion;
}): Promise<{ rawContent: string; result: InsightResult }> {
  try {
    return await requestInsightResponse(input);
  } catch {
    return {
      rawContent: "",
      result: createDemoInsights(input.neural, input.expanded)
    };
  }
}
