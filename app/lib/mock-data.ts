import { clamp } from "@/lib/utils";
import {
  buildEngagementArcExplanation,
  buildOverallVerdict
} from "@/lib/neural-translations";
import type {
  AudioResult,
  DirectedScene,
  HeadlineTestEntry,
  InsightResult,
  NeuralPrediction,
  RewriteSuggestion,
  ScriptExpansion,
  StoryboardFrame,
  TranscriptSegment,
  VideoResult
} from "@/lib/types";

function splitIntoScenes(script: string): string[] {
  const normalized = script
    .replace(/\n+/g, " ")
    .split(/[.!?]/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : [script.trim()];
}

export function createDemoScriptExpansion(script: string): ScriptExpansion {
  const scenes = splitIntoScenes(script).slice(0, 4);
  const sceneDuration = Math.max(6, Math.round(30 / Math.max(1, scenes.length)));

  return {
    title: "NeuroDraft Brain-Tested Campaign",
    duration_seconds: sceneDuration * scenes.length,
    scenes: scenes.map((segment, index) => ({
      id: index + 1,
      start_time: index * sceneDuration,
      end_time: (index + 1) * sceneDuration,
      description: `Photoreal product storytelling scene built around: ${segment}. Show authentic people, clear product framing, and tactile detail.`,
      camera: index === 0 ? "Slow dolly-in from medium wide to close-up" : "Handheld glide with subtle parallax",
      mood: index === 0 ? "Anticipatory optimism" : index % 2 === 0 ? "Warm confidence" : "Focused uplift",
      voiceover: segment,
      music_direction: index === 0 ? "Sparse piano and restrained pulse" : "Warm percussion with brand-safe lift",
      video_prompt: `Cinematic commercial scene: ${segment}. Photoreal actors, premium lighting, crisp product visibility, natural motion, emotionally resonant expressions, production-ready composition.`
    })),
    full_voiceover_script: scenes.join(". "),
    target_emotion: "Trust and momentum",
    brand_category: "Consumer packaged goods"
  };
}

export function createDemoDirectedScenes(expanded: ScriptExpansion): DirectedScene[] {
  return expanded.scenes.map((scene, index) => ({
    ...scene,
    resolution: "1080p",
    aspect_ratio: "16:9",
    emotional_intensity: index === 0 ? "high" : index % 2 === 0 ? "medium" : "high",
    audio_direction: `${scene.music_direction}. Keep voiceover intelligible and emotionally congruent.`,
    refined_prompt: `${scene.video_prompt} Cinematic 35mm lens feel, layered depth, emotionally calibrated performances, commercial polish, crisp product close-up, sync pacing to ${scene.mood.toLowerCase()}.`
  }));
}

function svgFrame(title: string, body: string, accent: string): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#0a0a0a" />
    <rect x="56" y="56" width="1168" height="608" rx="28" fill="#111111" stroke="${accent}" stroke-width="2" />
    <text x="96" y="180" font-family="Arial, sans-serif" font-size="34" fill="#00ff88">${title}</text>
    <text x="96" y="280" font-family="Arial, sans-serif" font-size="28" fill="#f8fafc">${body}</text>
    <text x="96" y="620" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">Scene previews generated from your script</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createDemoVideoResult(scenes: DirectedScene[]): VideoResult {
  const storyboard: StoryboardFrame[] = scenes.map((scene, index) => ({
    scene_id: scene.id,
    time_range: `${scene.start_time}-${scene.end_time}s`,
    frame_title: index === 0 ? "Opening brand moment" : `Scene ${scene.id} visual beat`,
    visual_description: scene.description,
    camera: scene.camera,
    mood: scene.mood,
    color_palette: index % 2 === 0 ? ["#0f172a", "#14532d", "#00ff88"] : ["#111827", "#1f2937", "#38bdf8"],
    key_element: scene.voiceover || scene.music_direction || `Scene ${scene.id} focus`,
    duration: scene.end_time - scene.start_time
  }));

  return {
    type: "storyboard",
    tier: "demo",
    banner: "Scene previews generated from your script",
    frames: null,
    storyboard,
    scenes
  };
}

export function createScriptTranscript(script: string, duration: number): TranscriptSegment[] {
  const words = script.split(/\s+/).filter(Boolean);
  const chunkSize = Math.max(6, Math.ceil(words.length / 5));
  const chunks: TranscriptSegment[] = [];

  for (let index = 0; index < words.length; index += chunkSize) {
    const chunkWords = words.slice(index, index + chunkSize);
    const start = (index / words.length) * duration;
    const end = ((index + chunkWords.length) / words.length) * duration;
    chunks.push({
      id: `segment-${index / chunkSize + 1}`,
      start,
      end,
      text: chunkWords.join(" ")
    });
  }

  return chunks;
}

export function createDemoAudioResult(script: string, duration: number): AudioResult {
  return {
    mode: "text-only",
    audio_url: null,
    transcript: createScriptTranscript(script, duration),
    duration,
    message: "Voiceover skipped or unavailable. Using script-derived transcript."
  };
}

export function createDemoNeuralPrediction(directed: DirectedScene[]): NeuralPrediction {
  const segments = directed.map((scene, index) => {
    const openerBoost = index === 0 ? 0.1 : 0;
    const productBoost = scene.description.toLowerCase().includes("product") ? 0.08 : 0;
    const pacePenalty = scene.end_time - scene.start_time < 5 ? 0.06 : 0;
    const visual = clamp(0.68 + openerBoost + productBoost - pacePenalty);
    const auditory = clamp(0.61 + (scene.audio_direction.includes("voiceover") ? 0.08 : 0));
    const attention = clamp(0.64 + productBoost + (scene.emotional_intensity === "high" ? 0.09 : 0));
    const emotional = clamp(0.58 + openerBoost + (scene.mood.toLowerCase().includes("warm") ? 0.06 : 0));
    const memory = clamp(0.55 + productBoost - pacePenalty + (index === directed.length - 1 ? 0.08 : 0));
    const overall = clamp((visual + auditory + attention + emotional + memory) / 5);

    return {
      scene_id: scene.id,
      time_start: scene.start_time,
      time_end: scene.end_time,
      neural_scores: {
        visual_cortex_engagement: visual,
        auditory_cortex_engagement: auditory,
        prefrontal_attention: attention,
        amygdala_emotional_arousal: emotional,
        hippocampal_memory_encoding: memory,
        overall_engagement: overall
      },
      peak_moment: `Scene ${scene.id} peaks when the product is clearly visible alongside the emotional beat.`,
      drop_moment: `Scene ${scene.id} softens when the narrative pace outruns the product story.`,
      predicted_recall_probability: clamp(0.63 + openerBoost + memory * 0.22)
    };
  });

  const mean = clamp(segments.reduce((sum, segment) => sum + segment.neural_scores.overall_engagement, 0) / Math.max(1, segments.length));
  const memoryStrength = clamp(segments.reduce((sum, segment) => sum + segment.neural_scores.hippocampal_memory_encoding, 0) / Math.max(1, segments.length));
  const attention = clamp(segments.reduce((sum, segment) => sum + segment.neural_scores.prefrontal_attention, 0) / Math.max(1, segments.length));
  const percentile = Math.round(68 + mean * 22);

  return {
    label: "TRIBE v2-calibrated prediction",
    mode: "demo",
    segments,
    overall: {
      mean_engagement: mean,
      engagement_arc: mean > 0.72 ? "rising" : "volatile",
      emotional_valence: "positive",
      memory_strength: memoryStrength,
      attention_retention: attention,
      neural_grade: mean > 0.82 ? "A" : mean > 0.72 ? "B" : mean > 0.62 ? "C" : "D",
      benchmark_percentile: percentile
    }
  };
}

export function createDemoInsights(
  neural: NeuralPrediction,
  expanded: ScriptExpansion
): InsightResult {
  const weakest = [...neural.segments].sort(
    (left, right) => left.neural_scores.overall_engagement - right.neural_scores.overall_engagement
  )[0];

  const weakestScene = expanded.scenes.find((scene) => scene.id === weakest.scene_id) ?? expanded.scenes[0];
  const strongestScene = [...neural.segments].sort(
    (left, right) => right.neural_scores.overall_engagement - left.neural_scores.overall_engagement
  )[0];

  const rewriteSuggestion: RewriteSuggestion = {
    scene_id: weakest.scene_id,
    original_line: weakestScene.voiceover || weakestScene.description,
    rewritten_line: "Open with the strongest benefit, name the brand earlier, and close with a line that feels memorable and specific.",
    reason: "This keeps the best emotional beat but gives the viewer a clearer brand cue sooner."
  };

  const headlineTest: HeadlineTestEntry[] = [
    {
      headline: "Real Ingredients. Real Recall.",
      predicted_recall_score: 82,
      why: "Short, specific, and easy to remember."
    },
    {
      headline: "The Morning Ritual Your Brain Remembers.",
      predicted_recall_score: 74,
      why: "Connects habit with memory, which fits the warm opening."
    },
    {
      headline: "Taste the Product People Keep Thinking About.",
      predicted_recall_score: 69,
      why: "A little longer, but it leans into memorability."
    }
  ];

  const insights = [
    {
      id: "insight_1",
      title: "Open Harder",
      finding: "The opening scene carries the strongest recall leverage, but it needs a sharper hook to grab attention right away.",
      recommendation: "Reveal the brand asset in the first two seconds while keeping the emotional beat intact.",
      impact: "high" as const,
      metric_affected: "Overall engagement",
      scene_ref: expanded.scenes[0]?.id ?? 1
    },
    {
      id: "insight_2",
      title: "Tighten Pace",
      finding: "The weakest scene is losing some momentum, which makes it easier for viewers to drift.",
      recommendation: "Give the weakest scene one extra beat before the next visual switch.",
      impact: "medium" as const,
      metric_affected: "Memory strength",
      scene_ref: weakest.scene_id
    },
    {
      id: "insight_3",
      title: "Match Music",
      finding: "Audio congruence is helping, but the score says the sonic signature could be more distinctive.",
      recommendation: "Use a music bed that mirrors the scene mood more tightly and lifts on the product reveal.",
      impact: "medium" as const,
      metric_affected: "Sound impact",
      scene_ref: strongestScene?.scene_id ?? 1
    },
    {
      id: "insight_4",
      title: "Show Product",
      finding: "Conscious attention rises when the product is obvious, then drops when lifestyle imagery takes over.",
      recommendation: "Anchor each scene with one unmistakable product visual or pack shot.",
      impact: "high" as const,
      metric_affected: "Conscious attention",
      scene_ref: expanded.scenes.find((scene) => scene.voiceover.length > 0)?.id ?? 1
    },
    {
      id: "insight_5",
      title: "End Sticky",
      finding: "The closing moment is emotionally warm, but it could leave a stronger memory trace.",
      recommendation: "End with a branded payoff line paired with a slower, cleaner final frame.",
      impact: "high" as const,
      metric_affected: "Overall engagement",
      scene_ref: expanded.scenes.at(-1)?.id ?? expanded.scenes[expanded.scenes.length - 1]?.id ?? 1
    }
  ];

  return {
    insights,
    rewrite_suggestion: rewriteSuggestion,
    headline_test: headlineTest,
    overall_verdict: buildOverallVerdict(neural, insights.length),
    engagement_arc_explanation: buildEngagementArcExplanation(neural)
  };
}
