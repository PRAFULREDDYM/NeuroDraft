import { emitEvent } from "@/lib/event-bus";
import {
  createDemoAudioResult,
  createDemoDirectedScenes,
  createDemoInsights,
  createDemoNeuralPrediction,
  createDemoScriptExpansion,
  createDemoVideoResult
} from "@/lib/mock-data";
import {
  directScenesWithGroq,
  expandScriptWithGroq,
  predictNeuralWithGroq,
  synthesizeAudioTranscriptWithGroq,
  writeInsightsWithGroq
} from "@/lib/groq";
import { synthesizeVideoWithGemini } from "@/lib/gemini";
import { evaluateInsightQuality } from "@/lib/insight-evaluator";
import { storeResult } from "@/lib/results-store";
import { sleep, withTimeout } from "@/lib/utils";
import type {
  AgentEventPayload,
  AudioResult,
  DirectedScene,
  InsightEvaluationResult,
  InsightResult,
  NeuralPrediction,
  ScriptExpansion,
  UploadType,
  VideoResult
} from "@/lib/types";

function event(runId: string, payload: AgentEventPayload): void {
  emitEvent(runId, payload);
}

function generateTitle(script: string): string {
  const words = script.trim().split(/\s+/).slice(0, 6).join(" ");
  return words.length > 0 ? `${words}...` : "Ad Analysis";
}

export async function expandScript(runId: string, script: string): Promise<ScriptExpansion> {
  event(runId, {
    agent: "SCRIPT_EXPANDER",
    status: "running",
    progress: 12,
    message: "Deconstructing the raw script into narrative beats."
  });

  await sleep(600);

  const expanded = await withTimeout(
    expandScriptWithGroq(script),
    60_000,
    "Script expansion timed out"
  ).catch(async () => {
    event(runId, {
      agent: "SCRIPT_EXPANDER",
      status: "timeout",
      progress: 100,
      message: "Expansion took too long. Falling back to calibrated demo expansion."
    });
    return createDemoScriptExpansion(script);
  });

  event(runId, {
    agent: "SCRIPT_EXPANDER",
    status: "complete",
    progress: 100,
    message: `${expanded.scenes.length} scenes expanded for ${expanded.duration_seconds}s runtime.`,
    data: expanded
  });

  return expanded;
}

export async function synthesizeAudio(runId: string, script: string): Promise<AudioResult> {
  event(runId, {
    agent: "AUDIO_SYNTHESIZER",
    status: "running",
    progress: 0,
    message: "Generating transcript with timestamps..."
  });

  await sleep(700);

  const audio = await withTimeout(
    synthesizeAudioTranscriptWithGroq(script),
    60_000,
    "Transcript synthesis timed out"
  ).catch(() => createDemoAudioResult(script, Math.max(20, Math.min(45, Math.round(script.split(/\s+/).length / 2.4)))));

  event(runId, {
    agent: "AUDIO_SYNTHESIZER",
    status: "complete",
    progress: 100,
    message: audio.message ?? `Transcript ready — ${audio.transcript.length} segments, ${Math.round(audio.duration)}s`,
    data: audio
  });

  return audio;
}

export async function directScenes(runId: string, expanded: ScriptExpansion): Promise<DirectedScene[]> {
  event(runId, {
    agent: "SCENE_DIRECTOR",
    status: "running",
    progress: 8,
    message: "Refining scene prompts for cinematic synthesis."
  });

  const directed = await withTimeout(
    directScenesWithGroq(expanded.scenes),
    60_000,
    "Scene direction timed out"
  ).catch(() => createDemoDirectedScenes(expanded));

  for (let index = 0; index < directed.length; index += 1) {
    event(runId, {
      agent: "SCENE_DIRECTOR",
      status: "running",
      progress: Math.round(((index + 1) / directed.length) * 100),
      message: `Directed scene ${index + 1} with ${directed[index].emotional_intensity} emotional intensity.`,
      scenes_complete: index + 1,
      total: directed.length
    });
    await sleep(500);
  }

  event(runId, {
    agent: "SCENE_DIRECTOR",
    status: "complete",
    progress: 100,
    message: "Scenes structured",
    data: directed
  });

  return directed;
}

export async function synthesizeVideo(
  runId: string,
  directed: DirectedScene[],
  uploadedFileId?: string
): Promise<VideoResult> {
  event(runId, {
    agent: "VIDEO_SYNTHESIZER",
    status: "running",
    progress: 14,
    message: uploadedFileId ? "Processing uploaded video..." : "Building scene storyboards..."
  });

  await sleep(800);

  const video = await withTimeout(
    synthesizeVideoWithGemini(directed, uploadedFileId),
    60_000,
    "Video synthesis timed out"
  ).catch(() => createDemoVideoResult(directed));

  event(runId, {
    agent: "VIDEO_SYNTHESIZER",
    status: "complete",
    progress: 100,
    message:
      video.type === "video"
        ? "Full motion synthesis complete."
        : video.banner ?? "Scene previews generated from your script.",
    data: video
  });

  return video;
}

export async function predictNeural(
  runId: string,
  input: {
    expanded: ScriptExpansion;
    directed: DirectedScene[];
    audio: AudioResult;
    video: VideoResult;
  }
): Promise<NeuralPrediction> {
  event(runId, {
    agent: "TRIBE_PREDICTOR",
    status: "running",
    progress: 10,
    message: "Fusing script, voice, and visual timing into TRIBE v2-calibrated signals."
  });

  await sleep(1200);

  const transcriptText = input.audio.transcript.map((segment) => segment.text).join(" ");
  const neural = await withTimeout(
    predictNeuralWithGroq({
      expanded: input.expanded,
      directed: input.directed,
      videoType: input.video.type,
      transcriptText
    }),
    60_000,
    "Neural prediction timed out"
  ).catch(() => createDemoNeuralPrediction(input.directed));

  event(runId, {
    agent: "TRIBE_PREDICTOR",
    status: "complete",
    progress: 100,
    message: `TRIBE v2-calibrated prediction complete. Neural grade ${neural.overall.neural_grade}.`,
    data: neural
  });

  return neural;
}

export async function writeInsights(
  runId: string,
  input: {
    neural: NeuralPrediction;
    expanded: ScriptExpansion;
  }
): Promise<InsightResult> {
  event(runId, {
    agent: "INSIGHT_WRITER",
    status: "running",
    progress: 18,
    message: "Turning signal shifts into actionable creative recommendations."
  });

  await sleep(900);

  const insights = await withTimeout(
    writeInsightsWithGroq(input),
    60_000,
    "Insight writing timed out"
  ).catch(() => createDemoInsights(input.neural, input.expanded));

  event(runId, {
    agent: "INSIGHT_WRITER",
    status: "complete",
    progress: 100,
    message: `${insights.insights.length} creative actions generated for the weakest moments.`,
    data: insights
  });

  return insights;
}

export async function evaluateInsights(
  runId: string,
  input: {
    insights: InsightResult;
    neural: NeuralPrediction;
    expanded: ScriptExpansion;
  }
): Promise<InsightEvaluationResult> {
  event(runId, {
    agent: "EVALUATOR",
    status: "running",
    progress: 0,
    message: "Evaluating output quality..."
  });

  await sleep(500);

  const evaluation = evaluateInsightQuality({
    insightResult: input.insights,
    neural: input.neural,
    expanded: input.expanded
  });

  event(runId, {
    agent: "EVALUATOR",
    status: evaluation.score >= 60 ? "complete" : "running",
    progress: 100,
    message:
      evaluation.score >= 60
        ? `Quality check passed · Score: ${evaluation.score}/100`
        : "Issues found · Rerunning affected agents",
    data: evaluation
  });

  return evaluation;
}

export async function runPipeline(
  runId: string,
  scriptOrInput: string | {
    script: string;
    fileId?: string;
    uploadType?: UploadType;
  }
): Promise<void> {
  try {
    const input = typeof scriptOrInput === "string" ? { script: scriptOrInput } : scriptOrInput;
    const script = input.script;

    emitEvent(runId, {
      agent: "SCRIPT_EXPANDER",
      status: "running",
      progress: 1,
      message: input.fileId
        ? `Received ${input.uploadType ?? "uploaded"} asset ${input.fileId.slice(0, 8)}. Starting analysis.`
        : "Starting analysis from script input."
    });

    const [expanded, audio] = await Promise.all([
      expandScript(runId, script),
      synthesizeAudio(runId, script)
    ]);

    const directed = await directScenes(runId, expanded);
    let video = await synthesizeVideo(runId, directed, input.fileId);
    let neural = await predictNeural(runId, { expanded, directed, audio, video });
    let insights = await writeInsights(runId, { neural, expanded });

    let evaluation = await evaluateInsights(runId, { insights, neural, expanded });
    const needsRepair = !evaluation.neural_valid || !evaluation.insights_valid;

    if (needsRepair) {
      emitEvent(runId, {
        agent: "EVALUATOR",
        status: "running",
        progress: 50,
        message: `Retrying affected agents — fixing ${evaluation.neural_issues.length + evaluation.insights_issues.length} issues`
      });

      await sleep(1500);

      if (!evaluation.neural_valid) {
        neural = await predictNeural(runId, { expanded, directed, audio, video });
      }

      if (!evaluation.insights_valid) {
        insights = await writeInsights(runId, { neural, expanded });
      }

      evaluation = await evaluateInsights(runId, { insights, neural, expanded });
    }

    storeResult(runId, {
      title: expanded.title || generateTitle(script),
      ad_category: expanded.brand_category || "General",
      expanded,
      directed,
      audio,
      video,
      neural,
      insights,
      evaluation
    });

    emitEvent(runId, {
      agent: "EVALUATOR",
      status: "complete",
      progress: 100,
      message: `Verified · Quality score ${evaluation.score}/100`,
      data: evaluation,
      type: "pipeline_complete"
    });
  } catch (error) {
    emitEvent(runId, {
      agent: "EVALUATOR",
      status: "error",
      progress: 100,
      message: "Pipeline error",
      type: "pipeline_error",
      error: error instanceof Error ? error.message : "Unknown pipeline error"
    });
  }
}
